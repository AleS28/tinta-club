# PayPal — puesta en producción

La integración ya está en el código (suscripciones, compras, donaciones y webhooks). Para cobrar de verdad hay que configurar las variables en **Vercel** y el webhook en **PayPal Live**.

## 1. Crear app Live en PayPal

1. Entra en [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications).
2. Cambia el toggle de **Sandbox** a **Live** (arriba a la derecha).
3. **Apps & Credentials → Create App** (tipo *Merchant*).
4. Copia el **Client ID** y el **Secret** de Live.

> Necesitas una cuenta PayPal Business verificada para recibir pagos reales.

## 2. Variables en Vercel

En [Vercel → tinta-club → Settings → Environment Variables](https://vercel.com), añade estas variables para **Production** (y Preview si quieres probar):

| Variable | Valor |
|----------|--------|
| `PAYPAL_MODE` | `live` (o `sandbox` para pruebas) |
| `PAYPAL_CLIENT_ID` | Client ID de la app Live |
| `PAYPAL_CLIENT_SECRET` | Secret de la app Live |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Mismo Client ID (público) |
| `PAYPAL_WEBHOOK_ID` | ID del webhook (paso 3) |
| `NEXT_PUBLIC_APP_URL` | `https://tinta-club.vercel.app` |

Opcional: `PAYPAL_SUBSCRIPTION_PLAN_ID` si ya creaste el plan manualmente en PayPal.

**Importante:** `NEXT_PUBLIC_*` se embebe en el build. Tras cambiarlas, haz **Redeploy** en Vercel.

## 3. Webhook en PayPal

1. En el dashboard Live → **Webhooks → Add Webhook**.
2. URL: `https://tinta-club.vercel.app/api/paypal/webhook`
3. Eventos recomendados:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.REFUNDED`
4. Copia el **Webhook ID** → `PAYPAL_WEBHOOK_ID` en Vercel.

## 4. Comprobar localmente

```bash
npm run check:paypal
```

O visita (tras desplegar): `https://tinta-club.vercel.app/api/health/paypal`

Debe mostrar:
- `configured: true`
- `clientEnabled: true`
- `oauthOk: true`
- `hasWebhookId: true`
- `mode: "live"` (cuando vayas a cobrar de verdad)

## 5. Probar el flujo completo

### Sandbox en producción (recomendado antes de Live)

1. Pon credenciales **Sandbox** en Vercel con `PAYPAL_MODE=sandbox`.
2. Crea el webhook en el dashboard **Sandbox** apuntando a la misma URL.
3. Redeploy.
4. Inicia sesión → **Suscríbete** → paga con cuenta de prueba PayPal.
5. Deberías volver a `/biblioteca?subscription=success` con acceso premium.

### Live (cobros reales)

1. Cambia a credenciales Live y `PAYPAL_MODE=live`.
2. Webhook nuevo en dashboard Live.
3. Redeploy.
4. Haz una suscripción real de prueba ($6.49/mes).

## Flujos soportados

| Producto | API |
|----------|-----|
| Suscripción mensual | `POST /api/paypal/checkout` |
| Cancelar suscripción | `POST /api/paypal/cancel` |
| Compra capítulo | `POST /api/chapters/[id]/purchase` |
| Compra libro | `POST /api/books/[id]/purchase` |
| Donación | `POST /api/authors/[id]/donate` |
| Retorno post-pago | `GET /api/paypal/return` |
| Webhook (respaldo) | `POST /api/paypal/webhook` |

Tras aprobar en PayPal, el return activa la suscripción o captura la compra. El webhook es respaldo si el usuario cierra la pestaña.

## Plan de suscripción

Si no defines `PAYPAL_SUBSCRIPTION_PLAN_ID`, la app crea automáticamente producto + plan en PayPal y lo guarda en Firestore (`app_config/paypal_subscription_plan_live` o `_sandbox` según el modo).

Precio por defecto: **$6.49 USD/mes** (`DEFAULT_SUBSCRIPTION_PRICE`).

## Solución de problemas

| Síntoma | Causa probable |
|---------|----------------|
| "PayPal no está configurado" | Faltan `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` en Vercel |
| Botón Suscríbete no redirige a PayPal | Falta `NEXT_PUBLIC_PAYPAL_CLIENT_ID` o no redeployaste |
| Pago OK pero sin premium | Revisa Firebase Admin (`/api/health/admin`) y logs de `/api/paypal/return` |
| Webhook falla con 400 | `PAYPAL_WEBHOOK_ID` incorrecto o webhook creado en Sandbox mientras la app usa Live |
| OAuth falla | Client ID/Secret no coinciden con `PAYPAL_MODE` |
