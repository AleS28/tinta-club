/**
 * Modo lanzamiento: lectura abierta sin suscripción para construir comunidad.
 * Desactivar con NEXT_PUBLIC_LAUNCH_MODE=false cuando quieras volver al modelo de pago.
 */
export function isLaunchMode(): boolean {
  return process.env.NEXT_PUBLIC_LAUNCH_MODE !== "false";
}

export const LAUNCH_READING_LABEL = "Lectura abierta durante el lanzamiento";

export const LAUNCH_SUPPORT_LABEL = "Invita un café al Imperio";
