import { FirebaseError } from "firebase/app";

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error.message : fallback;
  }

  switch (error.code) {
    case "auth/popup-closed-by-user":
      return "Inicio de sesión cancelado.";
    case "auth/cancelled-popup-request":
      return "Espera a que termine el intento anterior.";
    case "auth/popup-blocked":
      return "El navegador bloqueó la ventana emergente. Permite popups para localhost o usa Chrome/Edge.";
    case "auth/operation-not-allowed":
      return "Google no está habilitado. Ve a Firebase → Authentication → Sign-in method → Google → Habilitar.";
    case "auth/invalid-oauth-client-id":
    case "auth/invalid-api-key":
      return "Configuración de Firebase incorrecta. Revisa las variables en .env.local.";
    case "auth/unauthorized-domain":
      return "Este dominio no está autorizado. Agrega localhost en Firebase → Authentication → Settings.";
    case "auth/invalid-email":
      return "El correo electrónico no es válido.";
    case "auth/user-disabled":
      return "Esta cuenta ha sido deshabilitada.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con este correo.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
    case "auth/network-request-failed":
      return "Error de conexión. Revisa tu internet e inténtalo de nuevo.";
    default:
      return fallback;
  }
}

export function isAuthCancellation(error: unknown): boolean {
  return error instanceof FirebaseError && error.code === "auth/popup-closed-by-user";
}
