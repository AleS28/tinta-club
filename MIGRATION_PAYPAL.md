# PayPal — configuración

## Variables de entorno

```
PAYPAL_MODE=sandbox          # o live
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=   # mismo Client ID (público)
PAYPAL_WEBHOOK_ID=              # ID del webhook en el dashboard
NEXT_PUBLIC_APP_URL=https://tinta-club.vercel.app
```

Opcional: `PAYPAL_SUBSCRIPTION_PLAN_ID` si ya creaste el plan en PayPal. Si no, la app crea producto + plan y lo cachea en Firestore (`app_config/paypal_subscription_plan`).

## Webhook

URL: `https://TU_DOMINIO/api/paypal/webhook`

Eventos recomendados:

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

## Flujos

| Producto | API |
|----------|-----|
| Suscripción mensual | `POST /api/paypal/checkout` |
| Cancelar suscripción | `POST /api/paypal/cancel` |
| Compra capítulo | `POST /api/chapters/[id]/purchase` |
| Compra libro | `POST /api/books/[id]/purchase` |
| Donación | `POST /api/authors/[id]/donate` |
| Retorno post-pago | `GET /api/paypal/return` |

Tras aprobar en PayPal, el return captura el order / activa la suscripción. El webhook es respaldo e ingreso al pool.
