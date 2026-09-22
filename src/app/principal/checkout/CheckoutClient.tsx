'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createPaymentOrder, processPaymentWebhook } from '@/app/actions/payment';
import Link from 'next/link';

interface Props {
  athlete: {
    id: string;
    sslc_name: string;
    full_name: string;
    usn: string;
    college_name: string;
    gender: string;
    amount_paid: number;
    payment_status: string;
    order_id?: string;
    payment_id?: string;
    ev1_name?: string;
    ev2_name?: string;
    rev_name?: string;
    is_relay: boolean;
    is_half_marathon: boolean;
  };
}

export default function CheckoutClient({ athlete }: Props) {
  const [isPaid, setIsPaid] = useState(athlete.payment_status === 'CONFIRMED');
  const [paymentId, setPaymentId] = useState(athlete.payment_id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const amount = Number(athlete.amount_paid) || 100;

  // Handle Instant Webhook Simulation
  const handleSimulateWebhook = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    // 1. Ensure order exists or generate one
    let activeOrderId = athlete.order_id;
    if (!activeOrderId) {
      const orderRes = await createPaymentOrder(athlete.id);
      if (orderRes.error) {
        setErrorMsg(orderRes.error);
        setIsProcessing(false);
        return;
      }
      activeOrderId = orderRes.orderId;
    }

    const generatedPayId = `pay_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 2. Call Webhook API route (exactly mirroring Razorpay server-to-server webhook callback)
    try {
      const response = await fetch('/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: activeOrderId,
          payment_id: generatedPayId,
          signature: 'simulated_test_razorpay_signature'
        })
      });

      const resData = await response.json();

      if (response.ok && resData.confirmed) {
        setIsPaid(true);
        setPaymentId(generatedPayId);
      } else {
        setErrorMsg(resData.error || 'Webhook verification failed.');
      }
    } catch (err: any) {
      setErrorMsg('Network error while simulating Razorpay webhook: ' + err.message);
    }

    setIsProcessing(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <Link href="/principal" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
          &larr; Back to Contingent Dashboard
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
          Registration Fee Payment
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Dr. ACS College of Engineering Athletics Meet 2026
        </p>
      </div>

      {isPaid ? (
        /* Confirmed Success State */
        <Card style={{ border: '2px solid var(--success)', background: 'rgba(16, 185, 129, 0.03)' }}>
          <CardContent style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              width: '72px', 
              height: '72px', 
              borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '2.5rem'
            }}>
              ✓
            </div>

            <div>
              <Badge variant="success" style={{ fontSize: '0.9rem', padding: '0.25rem 0.75rem' }}>
                REGISTRATION CONFIRMED
              </Badge>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.75rem' }}>
                Payment Successfully Verified!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Webhook reconciliation complete. The athlete has been officially enrolled.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div style={{ 
              width: '100%', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '1.25rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Athlete Name:</span>
                <span style={{ fontWeight: 700 }}>{athlete.sslc_name || athlete.full_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>College:</span>
                <span style={{ fontWeight: 600 }}>{athlete.college_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
                <span style={{ fontWeight: 800, color: 'var(--success)' }}>₹{amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment ID:</span>
                <span style={{ fontFamily: 'monospace' }}>{paymentId}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Note: Official Bib numbers and QR access tokens will be automatically allocated in sorted college blocks once the registration window is closed by administrators.
            </p>

            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <Link href="/principal/register" style={{ flex: 1 }}>
                <Button variant="secondary" style={{ width: '100%' }}>
                  + Register Another Athlete
                </Button>
              </Link>
              <Link href="/principal" style={{ flex: 1 }}>
                <Button variant="primary" style={{ width: '100%' }}>
                  Return to Dashboard
                </Button>
              </Link>
            </div>

          </CardContent>
        </Card>
      ) : (
        /* Invoice & Payment Pending State */
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle>Invoice Details</CardTitle>
              <Badge variant="warning">PAYMENT PENDING</Badge>
            </div>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    {athlete.sslc_name || athlete.full_name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    USN: {athlete.usn} &bull; {athlete.college_name}
                  </p>
                </div>
                <Badge variant="default" style={{ textTransform: 'capitalize' }}>
                  {athlete.gender}
                </Badge>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Selected Disciplines
                </span>
                <ul style={{ marginTop: '0.25rem', paddingLeft: '1.25rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {athlete.ev1_name && <li><b>Event 1:</b> {athlete.ev1_name} (₹100)</li>}
                  {athlete.ev2_name && <li><b>Event 2:</b> {athlete.ev2_name} (₹100)</li>}
                  {athlete.is_relay && <li style={{ color: '#2563eb' }}><b>4x100m Relay:</b> Squad Member (₹100)</li>}
                  {athlete.is_half_marathon && <li style={{ color: '#7c3aed' }}><b>21km Half Marathon:</b> Participant (₹100)</li>}
                  {athlete.rev_name && <li style={{ color: 'var(--success)' }}><b>Reserve:</b> {athlete.rev_name} (FREE)</li>}
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Fee Due:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  ₹{amount}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: 'var(--radius-sm)', 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: 'var(--danger)', 
                fontSize: '0.85rem' 
              }}>
                {errorMsg}
              </div>
            )}

            {/* Payment Button & Simulator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Instant Razorpay Webhook Simulator Button */}
              <button
                type="button"
                onClick={handleSimulateWebhook}
                disabled={isProcessing}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: isProcessing ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                }}
              >
                {isProcessing ? 'Verifying Webhook with Database...' : `⚡ Simulate Razorpay Webhook & Confirm (₹${amount})`}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <p><b>Constraint: No Webhook = No Registration</b></p>
                <p>Clicking this executes the exact server-side Razorpay webhook handler to verify payment signature and transition status to <code>CONFIRMED</code>.</p>
              </div>

            </div>

          </CardContent>
        </Card>
      )}

    </div>
  );
}
