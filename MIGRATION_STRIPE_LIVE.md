# Migración Stripe Test → Live — El Imperio de la Tinta

Guía paso a paso para activar pagos reales sin incoherencias en el pool de regalías (`monthly_pools`).

**Producción:** https://tinta-club.vercel.app  
**Webhook:** `POST /api/stripe/webhook`

---

## Resumen del flujo financiero (post-fix)

| Tipo | Evento que acredita dinero | Evento que activa acceso |
|------|---------------------------|---------------------------|
| Suscripción mensual | `invoice.payment_succeeded` → `monthly_pools` | `checkout.session.completed` (`mode=subscription`) → Firebase premium |
| Compra directa capítulo | `checkout.session.completed` (`mode=payment`) → `direct_chapter_sales` | Mismo evento → `chapter_purchases` |
| Reembolso | `charge.refunded` → ajuste negativo pool o venta directa | Revoca acceso capítulo si aplica |

**Idempotencia:** colección Firestore `stripe_processed_events` (claves `event_*`, `invoice_pool_*`, `checkout_payment_*`, `charge_refund_*`).

---

## Fase 0 — Pre-requisitos

- [ ] `npm run build` pasa sin errores en la rama a desplegar.
- [ ] Firestore Admin configurado en Vercel (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
- [ ] Reglas de Firestore desplegadas (colecciones `stripe_processed_events`, `chapter_purchases` solo servidor).
- [ ] Cuenta Stripe verificada para **Live** (datos fiscales, cuenta bancaria).
- [ ] Acceso a [Stripe Dashboard Live](https://dashboard.stripe.com/apikeys) y [Vercel → Settings → Environment Variables](https://vercel.com).

---

## Fase 1 — Variables de entorno en Vercel

Configurar en **Production** (y opcionalmente Preview si quieres staging con claves test):

| Variable | Valor Live | Notas |
|----------|------------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Dashboard → Developers → API keys → **Secret key** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Clave publicable Live |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Del endpoint Live (Fase 2), **no** reutilizar el de Test |
| `NEXT_PUBLIC_APP_URL` | `https://tinta-club.vercel.app` | URLs de success/cancel de Checkout |
| `FIREBASE_*` | (sin cambio) | Service account producción |
| `CRON_SECRET` | (sin cambio) | Cierre mensual `/api/cron/close-month` |

### Pasos en Vercel

1. Proyecto → **Settings** → **Environment Variables**.
2. Editar o crear cada variable para el entorno **Production**.
3. Pegar claves **Live** (`sk_live_`, `pk_live_`). No mezclar Test y Live en el mismo entorno.
4. **Redeploy** obligatorio tras cambiar variables (Deployments → ⋮ → Redeploy).

### Checklist local (`.env.local`)

Solo para desarrollo; **nunca** commitear claves Live:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # del `stripe listen` local
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Fase 2 — Webhook en Stripe Live

1. [Stripe Dashboard](https://dashboard.stripe.com) → alternar a **Live** (interruptor arriba a la derecha).
2. **Developers** → **Webhooks** → **Add endpoint**.
3. **Endpoint URL:**
   ```
   https://tinta-club.vercel.app/api/stripe/webhook
   ```
4. **Events to send** — seleccionar exactamente:

   - [ ] `checkout.session.completed`
   - [ ] `invoice.payment_succeeded`
   - [ ] `charge.refunded`
   - [ ] `customer.subscription.updated`
   - [ ] `customer.subscription.deleted`

5. Crear endpoint → copiar **Signing secret** (`whsec_...`) → pegar en Vercel como `STRIPE_WEBHOOK_SECRET` → redeploy.

6. En **Webhooks** → endpoint → **Recent deliveries**: verificar respuestas `200` tras las pruebas de Fase 4.

### Eventos que NO deben acreditar el pool dos veces

- `checkout.session.completed` con `mode=subscription` → **solo** activa premium; no toca `monthly_pools`.
- `invoice.payment_succeeded` con factura de suscripción → **único** crédito al pool.

---

## Fase 3 — Testing local / staging con Stripe CLI

### Instalación (una vez)

```powershell
# Windows (Scoop)
scoop install stripe

# O descarga: https://stripe.com/docs/stripe-cli
stripe login
```

### Terminal 1 — App local

```powershell
cd "c:\Users\Usuario\Documents\TINTA CLUB"
npm run dev
```

### Terminal 2 — Reenvío de webhooks

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copiar el **Webhook signing secret** que imprime (`whsec_...`) y actualizar `STRIPE_WEBHOOK_SECRET` en `.env.local`. Reiniciar `npm run dev`.

> **Staging en Vercel (Preview):** puedes usar `stripe listen --forward-to https://TU-PREVIEW.vercel.app/api/stripe/webhook` con claves **test** en Preview, o el webhook de Test apuntando al preview. Para Live, las pruebas reales van siempre contra Production.

---

### Comandos exactos — simular eventos

Ejecutar en **Terminal 3** (con `stripe listen` activo en Terminal 2).

#### 1. `invoice.payment_succeeded` (pool de suscripción)

Dispara una factura de suscripción de prueba y reenvía el evento al webhook:

```powershell
stripe trigger invoice.payment_succeeded
```

**Verificar en Firestore:**

- `stripe_processed_events` → doc `invoice_pool_in_...` y `event_evt_...`
- `monthly_pools/{YYYY-MM}` → incremento en `subscriptionNet`, `authorsPool70`, `platformPool30`

**Verificar en logs del servidor:**

```
[stripe/webhook]   (sin error; respuesta 200)
```

> El trigger genérico no incluye `firebaseUid` en metadata. Para probar activación premium + pool con un usuario real, completa una suscripción Test desde la app (`/api/stripe/checkout`) y deja que Stripe envíe los eventos reales.

---

#### 2. `checkout.session.completed` (`mode=payment` — compra de capítulo)

Simular sesión de pago único con metadata que espera el webhook:

```powershell
stripe trigger checkout.session.completed --override checkout_session:mode=payment --override checkout_session:payment_status=paid --override checkout_session:metadata.type=chapter_purchase --override checkout_session:metadata.firebaseUid=UID_FIREBASE_DE_PRUEBA --override checkout_session:metadata.userId=UID_FIREBASE_DE_PRUEBA --override checkout_session:metadata.chapterId=ID_CAPITULO_PREMIUM --override checkout_session:metadata.bookId=ID_LIBRO --override checkout_session:metadata.authorId=ID_AUTOR --override checkout_session:amount_total=100
```

Reemplazar `UID_FIREBASE_DE_PRUEBA`, `ID_CAPITULO_PREMIUM`, `ID_LIBRO`, `ID_AUTOR` con IDs reales de tu Firestore.

**Verificar en Firestore:**

- `stripe_processed_events` → `checkout_payment_cs_...`
- `direct_chapter_sales/{sessionId}` → reparto 70/30
- `chapter_purchases/{userId}_{chapterId}` → `active: true`

**Flujo recomendado (más realista que el trigger):**

1. Iniciar sesión en la app con usuario test.
2. Abrir capítulo premium → **Comprar capítulo · $1.00**.
3. Pagar con tarjeta test `4242 4242 4242 4242`.
4. Stripe enviará `checkout.session.completed` real con metadata correcta.

---

#### 3. `charge.refunded` (reembolso)

Primero necesitas un cargo existente. Opción A — trigger automático:

```powershell
stripe trigger charge.refunded
```

Opción B — reembolsar un pago real de test (recomendado para venta directa):

```powershell
# Listar payment intents recientes
stripe payment_intents list --limit 5

# Reembolsar (sustituir pi_... por el ID de la compra de capítulo)
stripe refunds create --payment-intent pi_XXXXXXXXXXXX
```

Eso genera `charge.refunded` hacia tu webhook.

**Verificar:**

- Venta directa: `direct_chapter_sales` → `refundedAt`; `chapter_purchases` → `active: false`
- Suscripción: `monthly_pools` → montos negativos aplicados (clamp a 0 si excede)

---

### Suscripción — par de eventos en orden

Para validar que **no hay doble conteo**:

```powershell
# 1) Solo activa premium (no pool)
stripe trigger checkout.session.completed --override checkout_session:mode=subscription --override checkout_session:metadata.firebaseUid=UID_FIREBASE_DE_PRUEBA

# 2) Acredita pool (una sola vez)
stripe trigger invoice.payment_succeeded
```

Comprobar que `monthly_pools` solo aumentó **una vez** (por el invoice, no por checkout).

---

## Fase 4 — Prueba Live con ~$1 USD real

Usar compra directa de capítulo (precio por defecto **$1 USD**).

### Checklist

- [ ] Variables Live en Vercel + redeploy completado.
- [ ] Webhook Live creado con los 5 eventos.
- [ ] Usuario de prueba **sin** suscripción premium activa.
- [ ] Capítulo premium accesible en producción.

### Pasos

1. Ir a un capítulo premium en https://tinta-club.vercel.app/leer/{chapterId}.
2. Clic en **Comprar capítulo · $1.00**.
3. Completar pago Live con tarjeta real (cargo ~$1 + comisión Stripe).
4. Volver a la app (`?purchase=success`) → contenido desbloqueado.
5. En Stripe Dashboard **Live** → **Payments**: pago `succeeded`.
6. En **Webhooks** → delivery `checkout.session.completed` → **200**.
7. En Firestore:
   - [ ] `direct_chapter_sales/{cs_live_...}` creado
   - [ ] `chapter_purchases/{uid}_{chapterId}` con `active: true`
   - [ ] `stripe_processed_events/checkout_payment_{sessionId}` existe
8. **No** debe incrementarse `monthly_pools` por esta compra (solo venta directa).

### Prueba suscripción Live (opcional, ~$6.49)

1. Suscribirse desde la app.
2. Verificar **un solo** incremento en `monthly_pools` (evento `invoice.payment_succeeded`).
3. Verificar premium activo sin segundo crédito por `checkout.session.completed`.

### Reembolso Live del $1 (opcional)

1. Stripe Dashboard Live → Payment → **Refund**.
2. Verificar webhook `charge.refunded` → 200.
3. Usuario pierde acceso al capítulo; venta marcada reembolsada.

---

## Fase 5 — Alertas y monitoreo de logs

### Vercel (Production)

1. **Deployments** → deployment activo → **Logs** / **Runtime Logs**.
2. Filtrar por:
   - `[stripe/webhook]`
   - `[chapters/purchase]`
   - `Error procesando evento`

### Patrones a vigilar

| Log / síntoma | Severidad | Acción |
|---------------|-----------|--------|
| `Firma inválida` | Alta | Revisar `STRIPE_WEBHOOK_SECRET` (Test vs Live mezclados) |
| `Error procesando evento` + 500 en Stripe | Alta | Ver stack trace; evento quedó marcado en `stripe_processed_events` y **no se reintenta** |
| `chapter purchase missing metadata` | Media | Revisar metadata en Checkout Session |
| Webhook 200 pero pool no sube | Media | Confirmar evento es `invoice.payment_succeeded` y factura de suscripción |
| Pool sube dos veces por un pago | Crítica | Revisar duplicados en `stripe_processed_events` (`invoice_pool_*`) |
| `duplicate: true` en respuesta | Info | Idempotencia funcionando; evento ya procesado |

### Alertas recomendadas

- [ ] Stripe Dashboard → Webhooks → activar **email on failed deliveries**.
- [ ] Vercel → **Integrations** → alertas por errores 5xx en rutas `/api/stripe/*`.
- [ ] Revisión manual semanal de `monthly_pools` vs Stripe **Balance** / **Reports**.

### Consultas Firestore útiles (Firebase Console)

- `stripe_processed_events` ordenado por `processedAt` desc — auditoría de eventos.
- `monthly_pools/{mes actual}` — totales `subscriptionNet`, `authorsPool70`.
- `direct_chapter_sales` donde `createdAt` > fecha de migración.

---

## Fase 6 — Rollback de emergencia

Si algo falla tras activar Live:

1. **Desactivar endpoint webhook Live** en Stripe (o cambiar URL temporalmente) para detener acreditaciones.
2. Revertir en Vercel a claves **Test** (`sk_test_`, `pk_test_`) + redeploy.
3. Documentar pagos Live recibidos durante la ventana y conciliar manualmente en Firestore.
4. No borrar documentos de `stripe_processed_events` (evita reprocesar y duplicar).

---

## Referencia rápida — archivos del código

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/app/api/stripe/webhook/route.ts` | Handlers Stripe + idempotencia |
| `src/app/api/chapters/[chapterId]/purchase/route.ts` | Checkout one-time capítulo |
| `src/lib/monetization/stripe-processed-events-admin.ts` | Claim idempotente |
| `src/lib/monetization/monthly-pool-admin.ts` | Pool suscripciones |
| `src/lib/monetization/direct-sales-admin.ts` | Ventas directas 70/30 |

---

## Comandos CLI — copiar y pegar (resumen)

Scripts npm incluidos (cargan `.env.local` automáticamente):

```powershell
# Terminal 1 — app
npm run dev

# Terminal 2 — reenvío webhooks
npm run stripe:listen
# Copiar el whsec_... que imprime → STRIPE_WEBHOOK_SECRET en .env.local → reiniciar dev

# Terminal 3 — disparar eventos (deben mostrar [200] en Terminal 2)
npm run stripe:trigger:invoice
npm run stripe:trigger:checkout
npm run stripe:trigger:refund
```

Equivalente manual:

```powershell
# Escuchar webhooks localmente
npx tsx scripts/stripe-cli.ts listen --forward-to localhost:3000/api/stripe/webhook

# Pool — suscripción
npx tsx scripts/stripe-cli.ts trigger invoice.payment_succeeded

# Compra capítulo (payment mode + metadata)
npx tsx scripts/stripe-cli.ts trigger checkout.session.completed --override checkout_session:mode=payment --override checkout_session:payment_status=paid --override checkout_session:metadata.type=chapter_purchase --override checkout_session:metadata.firebaseUid=UID_FIREBASE_DE_PRUEBA --override checkout_session:metadata.userId=UID_FIREBASE_DE_PRUEBA --override checkout_session:metadata.chapterId=ID_CAPITULO --override checkout_session:metadata.bookId=ID_LIBRO --override checkout_session:metadata.authorId=ID_AUTOR --override checkout_session:amount_total=100

# Reembolso (genérico)
npx tsx scripts/stripe-cli.ts trigger charge.refunded

# Reembolso de un pago concreto
npx tsx scripts/stripe-cli.ts refunds create --payment-intent pi_XXXXXXXXXXXX
```

### Verificación alternativa (sin `stripe listen`)

Si ya tienes `STRIPE_WEBHOOK_SECRET` en `.env.local` (del `stripe listen` activo):

```powershell
npm run test:stripe-webhooks
# o contra otro puerto:
npx tsx scripts/test-stripe-webhooks-local.ts http://localhost:3002
```

Esperado en consola del servidor: `POST /api/stripe/webhook 200`.

### Troubleshooting local

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `the API key provided is too short` | `STRIPE_SECRET_KEY` vacía o inválida en `.env.local` | Pegar `sk_test_...` completa desde Stripe Dashboard |
| `You have not configured API keys` | Stripe CLI sin login ni API key | `stripe login` o usar scripts `stripe-cli.ts` |
| Webhook `500` local | Firebase Admin no escribe en Firestore | Corregir `FIREBASE_PRIVATE_KEY` (saltos `\\n`) o usar `firebase-service-account.json` |
| Webhook `400 Firma inválida` | `STRIPE_WEBHOOK_SECRET` no coincide con `stripe listen` | Copiar el `whsec_...` **actual** del listen activo |
| Puerto 3000 ocupado | Otro `next dev` colgado | Cerrar proceso o usar `--forward-to localhost:3002/api/stripe/webhook` |

---

*Última actualización: julio 2026 — tras fix de idempotencia y Checkout seguro para capítulos.*
