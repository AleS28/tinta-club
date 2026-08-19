"use client";

import { FormEvent, useEffect, useState } from "react";
import { BookOpen, Loader2, PenLine, X } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { BRAND_NAME } from "@/lib/brand";
import { isLaunchMode } from "@/lib/launch";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getAuthErrorMessage, isAuthCancellation } from "@/lib/auth-errors";
import type { RegistrationAccountType } from "@/types/registration";

type AuthMode = "login" | "register";

export function AuthModal() {
  const {
    authModalOpen,
    authModalIntent,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [accountType, setAccountType] = useState<RegistrationAccountType | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAuthorIntent = authModalIntent === "author";
  const isSubscribeIntent = authModalIntent === "subscribe";
  const isReaderRegisterIntent = authModalIntent === "reader";

  useEffect(() => {
    if (!authModalOpen) return;
    if (authModalIntent === "author") {
      setMode("register");
      setAccountType("author");
      return;
    }
    if (authModalIntent === "subscribe") {
      setMode("register");
      setAccountType("reader");
      return;
    }
    if (authModalIntent === "reader") {
      setMode("register");
      setAccountType("reader");
      return;
    }
    setMode("login");
    setAccountType(null);
  }, [authModalOpen, authModalIntent]);

  const resetForm = () => {
    setError("");
    setDisplayName("");
    setEmail("");
    setPassword("");
    setAccountType(null);
  };

  const handleClose = () => {
    resetForm();
    setMode("login");
    closeAuthModal();
  };

  if (!authModalOpen) return null;

  if (!isFirebaseConfigured) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden="true"
        />
        <div className="relative max-w-md rounded-2xl bg-paper p-6 shadow-2xl">
          <h2 className="font-serif text-xl font-bold text-ink">Firebase pendiente de configurar</h2>
          <p className="mt-2 text-sm text-muted">
            Agrega tus credenciales en <code className="text-terracotta">.env.local</code> para
            habilitar el inicio de sesión.
          </p>
          <button
            onClick={handleClose}
            className="mt-4 w-full rounded-full bg-terracotta py-2.5 text-sm font-bold text-white"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetForm();
    if (nextMode === "register" && isAuthorIntent) {
      setAccountType("author");
    }
    if (nextMode === "register" && isSubscribeIntent) {
      setAccountType("reader");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        if (!accountType) {
          setError("Selecciona si te registras como lector o como autor.");
          return;
        }
        if (accountType === "author" && !displayName.trim()) {
          setError("Ingresa tu nombre de autor o seudónimo.");
          return;
        }
        const name =
          displayName.trim() ||
          (accountType === "reader" ? email.split("@")[0] : "");
        if (!name) {
          setError("Ingresa un nombre para continuar.");
          return;
        }
        await signUpWithEmail(email, password, name, accountType);
      }
      resetForm();
      setMode("login");
    } catch (submitError) {
      setError(
        getAuthErrorMessage(
          submitError,
          mode === "login"
            ? "No pudimos iniciar sesión. Revisa tus credenciales."
            : "No pudimos crear tu cuenta. Intenta con otro correo.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (!accountType) {
          setError("Primero elige si te registras como lector o como autor.");
          return;
        }
        await loginWithGoogle({ registrationType: accountType });
      } else {
        await loginWithGoogle();
      }
      resetForm();
      setMode("login");
    } catch (googleError) {
      if (isAuthCancellation(googleError)) {
        setError(getAuthErrorMessage(googleError, ""));
        return;
      }
      setError(getAuthErrorMessage(googleError, "No pudimos conectar con Google. Intenta de nuevo."));
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === "register";
  const showRegistrationFields = !isRegister || accountType !== null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-paper shadow-2xl">
        <button
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-muted transition-colors hover:bg-sidebar hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-terracotta to-orange-700 px-6 py-8 text-white">
          <BrandLogo size="sm" variant="light" />
          <h2 className="mt-4 font-serif text-2xl font-bold">
            {isAuthorIntent && isRegister
              ? "Soy Escritor"
              : mode === "login"
                ? "Bienvenido de vuelta"
                : `Únete a ${BRAND_NAME}`}
          </h2>
          <p className="mt-1 text-sm text-white/85">
            {mode === "login"
              ? "Inicia sesión para continuar."
              : isAuthorIntent || accountType === "author"
                ? "Registro de autor — publica tus historias en el Imperio."
                : accountType === "reader"
                  ? "Registro de lector — descubre y apoya a tus autores favoritos."
                  : "Elige cómo quieres formar parte del Imperio."}
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="mb-5 flex rounded-full bg-sidebar p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                mode === "login" ? "bg-white text-ink shadow-sm" : "text-muted"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                mode === "register" ? "bg-white text-ink shadow-sm" : "text-muted"
              }`}
            >
              Registrarse
            </button>
          </div>

          {isRegister && !isAuthorIntent && !isSubscribeIntent && (
            <div className="mb-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                1. ¿Cómo quieres registrarte?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("reader")}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    accountType === "reader"
                      ? "border-terracotta bg-terracotta/5 shadow-sm"
                      : "border-sidebar bg-white hover:border-terracotta/40"
                  }`}
                >
                  <BookOpen
                    className={`h-5 w-5 ${accountType === "reader" ? "text-terracotta" : "text-muted"}`}
                  />
                  <p className="mt-2 text-sm font-bold text-ink">Lector</p>
                  <p className="mt-1 text-xs text-muted">Leer, guardar y suscribirte a obras.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("author")}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    accountType === "author"
                      ? "border-terracotta bg-terracotta/5 shadow-sm"
                      : "border-sidebar bg-white hover:border-terracotta/40"
                  }`}
                >
                  <PenLine
                    className={`h-5 w-5 ${accountType === "author" ? "text-terracotta" : "text-muted"}`}
                  />
                  <p className="mt-2 text-sm font-bold text-ink">Autor</p>
                  <p className="mt-1 text-xs text-muted">Publicar obras y capítulos en la plataforma.</p>
                </button>
              </div>
              {accountType === "author" && (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-950">
                  Como autor deberás firmar el acuerdo de publicación antes de publicar cualquier obra.
                </p>
              )}
            </div>
          )}

          {isRegister && isSubscribeIntent && (
            <p className="mb-5 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              {isLaunchMode()
                ? "Crea tu cuenta gratis para leer todos los capítulos durante el lanzamiento abierto."
                : "Crea tu cuenta de lector para suscribirte y desbloquear todos los capítulos premium."}
            </p>
          )}

          {isRegister && isReaderRegisterIntent && (
            <p className="mb-5 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              Crea tu cuenta gratis y empieza a leer en El Imperio de la Tinta.
            </p>
          )}

          {isRegister && isAuthorIntent && (
            <p className="mb-5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-950">
              Como autor deberás firmar el acuerdo de publicación en /autor/acuerdo antes de
              publicar cualquier obra.
            </p>
          )}

          {showRegistrationFields && (
            <>
              {isRegister && (
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  2. Completa tus datos
                </p>
              )}

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || (isRegister && !accountType)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-sidebar bg-white py-2.5 text-sm font-medium text-ink transition-colors hover:bg-sidebar disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <GoogleIcon />
                    Continuar con Google
                  </>
                )}
              </button>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-sidebar" />
                <span className="text-xs text-muted">o con correo</span>
                <div className="h-px flex-1 bg-sidebar" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && accountType === "author" && (
                  <div>
                    <label htmlFor="displayName" className="mb-1.5 block text-xs font-medium text-muted">
                      Nombre de autor / seudónimo
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ej. Will Flechas"
                      className="w-full rounded-xl border border-sidebar bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-terracotta"
                    />
                  </div>
                )}

                {isRegister && accountType === "reader" && (
                  <div>
                    <label htmlFor="displayName" className="mb-1.5 block text-xs font-medium text-muted">
                      Nombre (opcional)
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Cómo te gustaría que te llamemos"
                      className="w-full rounded-xl border border-sidebar bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-terracotta"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full rounded-xl border border-sidebar bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-terracotta"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-muted">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-sidebar bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-terracotta"
                  />
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || (isRegister && !accountType)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-terracotta py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                </button>
              </form>
            </>
          )}

          {isRegister && !accountType && (
            <p className="text-center text-sm text-muted">
              Selecciona Lector o Autor para continuar con el registro.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
