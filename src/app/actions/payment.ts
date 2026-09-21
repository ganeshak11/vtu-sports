'use server';

import { supabase } from '@/lib/supabase';
import { requireRole, AuthError } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';

export async function createPaymentOrder(athleteId: string) {
  let session;
  try {
    session = await requireRole('principal', 'admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!athleteId) return { error: 'Invalid athlete ID' };

  // Fetch athlete record
  const { data: athlete, error: athleteError } = await supabase
    .from('profiles')
    .select('id, sslc_name, full_name, college_name, amount_paid, payment_status')
    .eq('id', athleteId)
    .single();

  if (athleteError || !athlete) {
    return { error: 'Athlete record not found.' };
  }

  if (athlete.payment_status === 'CONFIRMED') {
    return { error: 'Registration is already confirmed and paid.' };
  }

  const amount = Number(athlete.amount_paid) || 100;
  const orderId = `order_vtu_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Record in orders table
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      order_id: orderId,
      college_code: session.collegeCode || 'COLLEGE',
      athlete_id: athleteId,
      amount,
      currency: 'INR',
      status: 'PENDING'
    });

  if (orderError) {
    console.error('Order creation error:', orderError);
    return { error: 'Failed to generate payment order' };
  }

  // Update profile with order_id
  await supabase
    .from('profiles')
    .update({ order_id: orderId })
    .eq('id', athleteId);

  return {
    success: true,
    orderId,
    amount,
    currency: 'INR',
    athleteName: athlete.sslc_name || athlete.full_name,
    collegeName: athlete.college_name,
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dracsce2026'
  };
}

export async function processPaymentWebhook(orderId: string, paymentId: string, signature?: string) {
  if (!orderId || !paymentId) {
    return { error: 'Missing orderId or paymentId for webhook verification.' };
  }

  // 1. Verify Order in DB
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, athlete_id, amount, status')
    .eq('order_id', orderId)
    .single();

  if (orderError || !order) {
    return { error: 'Order not found in system.' };
  }

  // 2. Update Order status to SUCCESS
  const { error: updateOrderErr } = await supabase
    .from('orders')
    .update({
      status: 'SUCCESS',
      payment_id: paymentId,
      signature: signature || 'simulated_valid_webhook_signature'
    })
    .eq('id', order.id);

  if (updateOrderErr) {
    console.error('Order update error:', updateOrderErr);
  }

  // 3. Update Athlete Profile to CONFIRMED
  const { error: profileUpdateErr } = await supabase
    .from('profiles')
    .update({
      payment_status: 'CONFIRMED',
      payment_id: paymentId,
      amount_paid: order.amount
    })
    .eq('id', order.athlete_id);

  if (profileUpdateErr) {
    console.error('Profile payment confirmation error:', profileUpdateErr);
    return { error: 'Failed to update athlete registration to CONFIRMED' };
  }

  revalidatePath('/principal');
  revalidatePath('/principal/checkout');
  revalidatePath('/admin');

  return { success: true, athleteId: order.athlete_id };
}
