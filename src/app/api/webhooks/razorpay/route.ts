import { NextRequest, NextResponse } from 'next/server';
import { processPaymentWebhook } from '@/app/actions/payment';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support standard Razorpay webhook payload format or direct testing payload
    // Razorpay payload typically has: event: 'payment.captured' or 'order.paid'
    const orderId = body?.payload?.payment?.entity?.order_id || body?.order_id || body?.orderId;
    const paymentId = body?.payload?.payment?.entity?.id || body?.payment_id || body?.paymentId || `pay_${Date.now()}`;
    const signature = req.headers.get('x-razorpay-signature') || body?.signature || 'valid_signature';

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id in webhook payload' }, { status: 400 });
    }

    const result = await processPaymentWebhook(orderId, paymentId, signature);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ status: 'ok', confirmed: true, athleteId: result.athleteId });
  } catch (error: any) {
    console.error('Razorpay webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook processing failed: ' + error.message }, { status: 500 });
  }
}
