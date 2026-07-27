"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { getClientAuth, db, isFirebaseConfigured } from "@/lib/firebase";
import { activateSubscription } from "@/lib/subscription";
import {
  isPremiumUser,
  normalizeUserProfile,
  type UserProfile,
  type UserRole,
} from "@/types/user";

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isSubscriber: boolean;
  role: UserRole;
  authModalOpen: boolean;
  authRedirectPath: string | null;
  openAuthModal: (redirectPath?: string) => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  subscribe: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const defaultProfile = (user: User): UserProfile => ({
  uid: user.uid,
  email: user.email ?? "",
  displayName: user.displayName ?? "Lector",
  role: "reader",
  isSubscriber: false,
  photoURL: user.photoURL ?? undefined,
});

const AUTH_REDIRECT_KEY = "tinta-club-auth-redirect";
const AUTH_PENDING_KEY = "tinta-club-auth-pending";

async function fetchOrCreateUserProfile(user: User): Promise<UserProfile> {
  if (!db) return defaultProfile(user);

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return normalizeUserProfile(userSnap.data() as UserProfile);
  }

  const profile = normalizeUserProfile(defaultProfile(user));
  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
  });

  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRedirectPath, setAuthRedirectPath] = useState<string | null>(null);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthRedirectPath(null);
  }, []);

  const openAuthModal = useCallback((redirectPath?: string) => {
    setAuthRedirectPath(redirectPath ?? null);
    setAuthModalOpen(true);
  }, []);

  const handleAuthSuccess = useCallback(
    (redirectPath: string | null) => {
      closeAuthModal();
      if (redirectPath) router.push(redirectPath);
    },
    [closeAuthModal, router],
  );

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        fetchOrCreateUserProfile(firebaseUser)
          .then((profile) => setUserProfile(normalizeUserProfile(profile)))
          .catch(() => setUserProfile(normalizeUserProfile(defaultProfile(firebaseUser))));

        if (sessionStorage.getItem(AUTH_PENDING_KEY)) {
          sessionStorage.removeItem(AUTH_PENDING_KEY);
          const storedRedirect = sessionStorage.getItem(AUTH_REDIRECT_KEY);
          sessionStorage.removeItem(AUTH_REDIRECT_KEY);
          closeAuthModal();
          if (storedRedirect) router.push(storedRedirect);
        }
      } else {
        setUserProfile(null);
      }
    });

    return unsubscribe;
  }, [closeAuthModal, router]);

  const loginWithGoogle = useCallback(async () => {
    const auth = getClientAuth();
    if (!auth) throw new Error("Firebase no está configurado");

    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");

    const redirect = authRedirectPath;
    sessionStorage.setItem(AUTH_PENDING_KEY, "1");
    if (redirect) {
      sessionStorage.setItem(AUTH_REDIRECT_KEY, redirect);
    }

    try {
      await signInWithPopup(auth, provider);
      sessionStorage.removeItem(AUTH_PENDING_KEY);
      if (redirect) sessionStorage.removeItem(AUTH_REDIRECT_KEY);
      handleAuthSuccess(redirect);
    } catch (error) {
      sessionStorage.removeItem(AUTH_PENDING_KEY);
      throw error;
    }
  }, [authRedirectPath, handleAuthSuccess]);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      const auth = getClientAuth();
      if (!auth) throw new Error("Firebase no está configurado");
      const redirect = authRedirectPath;
      await signInWithEmailAndPassword(auth, email, password);
      handleAuthSuccess(redirect);
    },
    [authRedirectPath, handleAuthSuccess],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      const auth = getClientAuth();
      if (!auth || !db) throw new Error("Firebase no está configurado");
      const redirect = authRedirectPath;

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName });

      const profile: UserProfile = {
        uid: credential.user.uid,
        email,
        displayName,
        role: "reader",
        isSubscriber: false,
      };

      await setDoc(doc(db, "users", credential.user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
      });

      setUserProfile(normalizeUserProfile(profile));
      handleAuthSuccess(redirect);
    },
    [authRedirectPath, handleAuthSuccess],
  );

  const subscribe = useCallback(async () => {
    if (!user) throw new Error("Debes iniciar sesión para suscribirte");
    await activateSubscription(user.uid);
    setUserProfile((prev) =>
      prev
        ? normalizeUserProfile({
            ...prev,
            isPremium: true,
            isSubscriber: true,
            subscriptionStatus: "premium",
          })
        : null,
    );
  }, [user]);

  const logout = useCallback(async () => {
    const auth = getClientAuth();
    if (!auth) return;
    await signOut(auth);
    router.push("/");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userProfile,
      loading,
      isSubscriber: isPremiumUser(userProfile),
      role: userProfile?.role ?? "reader",
      authModalOpen,
      authRedirectPath,
      openAuthModal,
      closeAuthModal,
      loginWithGoogle,
      loginWithEmail,
      signUpWithEmail,
      subscribe,
      logout,
    }),
    [
      user,
      userProfile,
      loading,
      authModalOpen,
      authRedirectPath,
      openAuthModal,
      closeAuthModal,
      loginWithGoogle,
      loginWithEmail,
      signUpWithEmail,
      subscribe,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
