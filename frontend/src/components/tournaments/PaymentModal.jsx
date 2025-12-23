import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, X, Loader } from 'lucide-react';
import { paymentAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const PaymentModal = ({ tournament, category, registrationData, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Initiate payment and get order details
      const orderResponse = await paymentAPI.initiatePayment(
        category.category_id,
        registrationData.player_id,
        category.entry_fee
      );

      if (!orderResponse.order_id) {
        throw new Error('Failed to create payment order');
      }

      setPaymentInitiated(true);

      // Step 2: Open Razorpay modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: category.entry_fee * 100, // Amount in paise
        currency: 'INR',
        name: tournament.name,
        description: `${category.category_name} - ${tournament.name}`,
        order_id: orderResponse.order_id,
        prefill: {
          name: registrationData.name,
          email: registrationData.email,
          contact: registrationData.phone,
        },
        notes: {
          tournament_id: tournament.tournament_id,
          category_id: category.category_id,
          player_id: registrationData.player_id,
          partner_id: registrationData.partner_id || null,
        },
        handler: async (response) => {
          try {
            // Step 3: Verify payment signature
            const verifyResponse = await paymentAPI.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verifyResponse.success) {
              // Payment verified successfully
              onSuccess({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                registration_data: registrationData,
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setError(err.message || 'Payment verification failed');
            setPaymentInitiated(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentInitiated(false);
            setError('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment');
      setPaymentInitiated(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
        <button
          onClick={onClose}
          disabled={loading || paymentInitiated}
          className="p-1 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Tournament & Category Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div>
          <p className="text-xs text-gray-600">Tournament</p>
          <p className="font-semibold text-gray-900">{tournament.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Category</p>
          <p className="font-semibold text-gray-900">{category.category_name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Match Type</p>
          <p className="font-semibold text-gray-900 capitalize">
            {category.match_type === 'singles'
              ? 'Singles'
              : category.match_type === 'doubles'
                ? 'Doubles'
                : 'Mixed Doubles'}
          </p>
        </div>
      </div>

      {/* Registration Details */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-gray-900">Registration Details</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium text-gray-900">{registrationData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-900">{registrationData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium text-gray-900">{registrationData.phone}</span>
          </div>
          {registrationData.partner_name && (
            <div className="flex justify-between">
              <span className="text-gray-600">Partner:</span>
              <span className="font-medium text-gray-900">{registrationData.partner_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Entry Fee</span>
          <span className="font-medium text-gray-900">₹{category.entry_fee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Taxes & Fees</span>
          <span className="font-medium text-gray-900">₹0</span>
        </div>
        <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2 mt-2">
          <span className="text-gray-900">Total Amount</span>
          <span className="text-blue-600">₹{category.entry_fee}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}

      {/* Info Message */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-900">
          You will be redirected to Razorpay to complete the payment securely.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onClose}
          disabled={loading || paymentInitiated}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={loading || paymentInitiated}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading || paymentInitiated ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay ₹' + category.entry_fee
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
