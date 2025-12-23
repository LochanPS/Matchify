import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const FeedbackButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 z-40"
        aria-label="Send Feedback"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default FeedbackButton;