import { CheckCircle2, Download, Share2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentConfirmation = ({ tournament, category, paymentData, onClose }) => {
  const navigate = useNavigate();

  const handleDownloadReceipt = () => {
    // Receipt download functionality
    const receiptContent = `
PAYMENT RECEIPT
===============

Tournament: ${tournament.name}
Category: ${category.category_name}
Date: ${new Date().toLocaleDateString()}

Payment Details:
- Amount: ₹${category.entry_fee}
- Payment ID: ${paymentData.payment_id}
- Order ID: ${paymentData.order_id}
- Status: SUCCESS

Registration Details:
- Name: ${paymentData.registration_data.name}
- Email: ${paymentData.registration_data.email}
- Phone: ${paymentData.registration_data.phone}

Thank you for registering!
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `receipt_${paymentData.payment_id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShareSuccess = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Tournament Registration Successful',
        text: `I just registered for ${category.category_name} in ${tournament.name}!`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
        <p className="text-gray-600">Your registration has been confirmed</p>
      </div>

      {/* Confirmation Details */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
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

      {/* Payment Receipt */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-gray-900">Payment Receipt</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-medium text-gray-900">₹{category.entry_fee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-mono text-xs text-gray-900 break-all">
              {paymentData.payment_id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono text-xs text-gray-900 break-all">
              {paymentData.order_id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date & Time:</span>
            <span className="font-medium text-gray-900">
              {new Date().toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium text-green-600">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Registered Player Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-gray-900">Registered As</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium text-gray-900">
              {paymentData.registration_data.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-900">
              {paymentData.registration_data.email}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium text-gray-900">
              {paymentData.registration_data.phone}
            </span>
          </div>
          {paymentData.registration_data.partner_name && (
            <div className="flex justify-between">
              <span className="text-gray-600">Partner:</span>
              <span className="font-medium text-gray-900">
                {paymentData.registration_data.partner_name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-900 mb-2">What's Next?</p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ Check your email for confirmation details</li>
          <li>✓ Tournament details will be shared soon</li>
          <li>✓ Matches will be generated before the tournament date</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleDownloadReceipt}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Receipt
        </button>
        <button
          onClick={handleShareSuccess}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Success
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        Back to Tournament
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PaymentConfirmation;
