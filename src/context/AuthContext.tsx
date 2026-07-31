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
import {
  clearAuthSessionHint,
  markAuthSessionHint,
  readAuthSessionHint,
} from "@/lib/auth-session";
import { activateSubscription } from "@/lib/subscription";
import { startStripeCheckout } from "@/lib/stripe-checkout";
import {
  isPremiumUser,
  normalizeUserProfile,
  type UserProfile,
  type UserRole,
} from "@/types/user";
import {
  clearPendingRegistrationType,
  consumeNewAuthorRegistration,
  markNewAuthorRegistration,
  readPendingRegistrationType,
  setPendingRegistrationType,
  type RegistrationAccountType,
  type AuthModalIntent,
  type OpenAuthModalOptions,
} from "@/types/registration";

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  restoringSession: boolean;
  isSubscriber: boolean;
  role: UserRole;
  authModalOpen: boolean;
  authRedirectPath: string | null;
  authModalIntent: AuthModalIntent;
  openAuthModal: (redirectPath?: string, options?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
  refreshUserProfile: () => Promise<void>;
  loginWithGoogle: (options?: { registrationType?: RegistrationAccountType }) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
    accountType: RegistrationAccountType,
  ) => Promise<void>;
  subscribe: (options?: {
    bookId?: string;
    redirectTo?: string;
    priceUsd?: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const defaultProfile = (user: User, role: UserRole = "reader"): UserProfile => ({
  uid: user.uid,
  email: user.email ?? "",
  displayName: user.displayName ?? (role === "author" ? "Autor" : "Lector"),
  role,
  isSubscriber: false,
  photoURL: user.photoURL ?? undefined,
});

const AUTH_REDIRECT_KEY = "tinta-club-auth-redirect";
const AUTH_PENDING_KEY = "tinta-club-auth-pending";

async function syncPremiumClaims(firebaseUser: User): Promise<void> {
  try {
    const token = await firebaseUser.getIdToken(true);
    const response = await fetch("/api/subscription/sync", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      await firebaseUser.getIdToken(true);
    }
  } catch {
    // Firestore ya tiene la suscripción; sync refuerza el token del servidor.
  }
}

async function fetchOrCreateUserProfile(user: User): Promise<UserProfile> {
  if (!db) return defaultProfile(user);

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data() as UserProfile;
    const authPhoto = user.photoURL ?? undefined;
    const storedPhoto = data.photoURL;

    if (
      authPhoto?.startsWith("http") &&
      (!storedPhoto || storedPhoto.startsWith("/authors/"))
    ) {
      await setDoc(userRef, { photoURL: authPhoto }, { merge: true });
      return normalizeUserProfile({ ...data, photoURL: authPhoto });
    }

    return normalizeUserProfile(data);
  }

  const pendingType = readPendingRegistrationType();
  const role: UserRole = pendingType === "author" ? "author" : "reader";
  clearPendingRegistrationType();

  const profile = normalizeUserProfile(defaultProfile(user, role));
  await setDoc(userRef, {
    ...profile,
    accountType: role,
    createdAt: serverTimestamp(),
  });

  if (role === "author") {
    markNewAuthorRegistration();
  }

  return profile;
}

async function tryLinkSiteAdmin(user: User): Promise<UserProfile | null> {
  if (!user.email) return null;

  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/auth/link-admin", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      linked?: boolean;
      profile?: UserProfile;
    };

    if (payload.profile?.role === "admin") {
      return normalizeUserProfile(payload.profile);
    }
  } catch {
    // El enlace es opcional; no bloquea el login.
  }

  return null;
}

async function tryLinkFounderAuthor(user: User): Promise<UserProfile | null> {
  if (!user.email) return null;

  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/auth/link-founder", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      linked?: boolean;
      profile?: UserProfile;
    };

    if (payload.profile) {
      return normalizeUserProfile(payload.profile);
    }
  } catch {
    // El enlace es opcional; no bloquea el login.
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoringSession, setRestoringSession] = useState(() => Boolean(readAuthSessionHint()));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRedirectPath, setAuthRedirectPath] = useState<string | null>(null);
  const [authModalIntent, setAuthModalIntent] = useState<AuthModalIntent>("default");

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthRedirectPath(null);
    setAuthModalIntent("default");
  }, []);

  const openAuthModal = useCallback((redirectPath?: string, options?: OpenAuthModalOptions) => {
    setAuthRedirectPath(redirectPath ?? null);
    setAuthModalIntent(options?.intent ?? "default");
    setAuthModalOpen(true);
  }, []);

  const handleAuthSuccess = useCallback(
    (redirectPath: string | null) => {
      closeAuthModal();

      if (consumeNewAuthorRegistration()) {
        router.push("/autor/acuerdo");
        return;
      }

      if (redirectPath) router.push(redirectPath);
    },
    [closeAuthModal, router],
  );

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      setRestoringSession(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    auth
      .authStateReady()
      .then(() => {
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser);
          setLoading(false);
          setRestoringSession(false);

          if (firebaseUser) {
            markAuthSessionHint(firebaseUser.uid);
            fetchOrCreateUserProfile(firebaseUser)
              .then(async (profile) => {
                let normalized = normalizeUserProfile(profile);
                const adminProfile = await tryLinkSiteAdmin(firebaseUser);
                if (adminProfile) {
                  normalized = adminProfile;
                } else {
                  const linkedProfile = await tryLinkFounderAuthor(firebaseUser);
                  if (linkedProfile) {
                    normalized = linkedProfile;
                  }
                }
                setUserProfile(normalized);
                if (isPremiumUser(normalized)) {
                  void syncPremiumClaims(firebaseUser);
                }
              })
              .catch(() => setUserProfile(normalizeUserProfile(defaultProfile(firebaseUser))));

            if (sessionStorage.getItem(AUTH_PENDING_KEY)) {
              sessionStorage.removeItem(AUTH_PENDING_KEY);
              const storedRedirect = sessionStorage.getItem(AUTH_REDIRECT_KEY);
              sessionStorage.removeItem(AUTH_REDIRECT_KEY);
              closeAuthModal();
              if (consumeNewAuthorRegistration()) {
                router.push("/autor/acuerdo");
              } else if (storedRedirect) {
                router.push(storedRedirect);
              }
            }
          } else {
            clearAuthSessionHint();
            setUserProfile(null);
          }
        });
      })
      .catch(() => {
        setLoading(false);
        setRestoringSession(false);
      });

    return () => unsubscribe?.();
  }, [closeAuthModal, router]);

  const loginWithGoogle = useCallback(
    async (options?: { registrationType?: RegistrationAccountType }) => {
      const auth = getClientAuth();
      if (!auth) throw new Error("Firebase no está configurado");

      if (options?.registrationType) {
        setPendingRegistrationType(options.registrationType);
      }

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
        clearPendingRegistrationType();
        sessionStorage.removeItem(AUTH_PENDING_KEY);
        throw error;
      }
    },
    [authRedirectPath, handleAuthSuccess],
  );

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
    async (
      email: string,
      password: string,
      displayName: string,
      accountType: RegistrationAccountType,
    ) => {
      const auth = getClientAuth();
      if (!auth || !db) throw new Error("Firebase no está configurado");
      const redirect = authRedirectPath;
      const role: UserRole = accountType === "author" ? "author" : "reader";

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName });

      const profile: UserProfile = {
        uid: credential.user.uid,
        email,
        displayName,
        role,
        isSubscriber: false,
      };

      await setDoc(doc(db, "users", credential.user.uid), {
        ...profile,
        accountType,
        createdAt: serverTimestamp(),
      });

      setUserProfile(normalizeUserProfile(profile));

      if (accountType === "author") {
        markNewAuthorRegistration();
      }

      handleAuthSuccess(redirect);
    },
    [authRedirectPath, handleAuthSuccess],
  );

  const subscribe = useCallback(
    async (options?: { bookId?: string; redirectTo?: string; priceUsd?: number }) => {
      if (!user) throw new Error("Debes iniciar sesión para suscribirte");

      if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        await startStripeCheckout(user, options);
        return;
      }

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

      try {
        await syncPremiumClaims(user);
      } catch {
        // Firestore ya quedó activa.
      }
    },
    [user],
  );

  const refreshUserProfile = useCallback(async () => {
    const auth = getClientAuth();
    const firebaseUser = auth?.currentUser;
    if (!firebaseUser || !db) return;

    let normalized = normalizeUserProfile(await fetchOrCreateUserProfile(firebaseUser));
    const adminProfile = await tryLinkSiteAdmin(firebaseUser);
    if (adminProfile) {
      normalized = adminProfile;
    }
    setUserProfile(normalized);

    if (isPremiumUser(normalized)) {
      try {
        await syncPremiumClaims(firebaseUser);
        await firebaseUser.getIdToken(true);
      } catch {
        // El perfil en Firestore ya refleja el estado.
      }
    }
  }, []);

  const logout = useCallback(async () => {
    const auth = getClientAuth();
    if (!auth) return;
    clearAuthSessionHint();
    await signOut(auth);
    router.push("/");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userProfile,
      loading,
      restoringSession,
      isSubscriber: isPremiumUser(userProfile),
      role: userProfile?.role ?? "reader",
      authModalOpen,
      authRedirectPath,
      authModalIntent,
      openAuthModal,
      closeAuthModal,
      refreshUserProfile,
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
      restoringSession,
      authModalOpen,
      authRedirectPath,
      authModalIntent,
      openAuthModal,
      closeAuthModal,
      refreshUserProfile,
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
