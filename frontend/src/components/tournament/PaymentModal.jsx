import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader } from 'lucide-react';

export default function PaymentModal({ tournament, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      setError('Payment system is loading. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create payment order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          tournament_id: tournament.tournament_id,
          amount: tournament.entry_fee,
        }),
      });

      if (!orderResponse.ok) {
        const data = await orderResponse.json();
        throw new Error(data.error || 'Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'MATCHIFY',
        description: `${tournament.tournament_name} - Entry Fee`,
        image: 'https://matchify.app/logo.png',
        handler: async (response) => {
          try {
            // Step 3: Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                order_id: orderData.order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                tournament_id: tournament.tournament_id,
              }),
            });

            if (!verifyResponse.ok) {
              const data = await verifyResponse.json();
              throw new Error(data.error || 'Payment verification failed');
            }

            // Payment successful
            if (onSuccess) {
              onSuccess();
            }
            onClose();
          } catch (err) {
            setError(err.message || 'Payment verification failed');
            setLoading(false);
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tournament Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">{tournament.tournament_name}</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>📍 {tournament.venue_address}</p>
            <p>📅 {new Date(tournament.tournament_date).toLocaleDateString()}</p>
            <p>🎾 {tournament.match_type}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="border-t border-b border-gray-200 py-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Entry Fee</span>
            <span className="text-2xl font-bold text-gray-900">
              ₹{tournament.entry_fee}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-gray-500 mb-4">
          You will be redirected to Razorpay to complete the payment securely.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || !razorpayLoaded}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
