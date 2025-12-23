import React, { useState, useEffect } from 'react';
import { Gift, Users, Star } from 'lucide-react';
import { referralAPI } from '../../services/api';

const ReferralSignup = ({ referralCode, onReferralValidated }) => {
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (referralCode) {
      validateReferralCode();
    }
  }, [referralCode]);
  
  const validateReferralCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await referralAPI.validate(referralCode);
      
      if (response.valid) {
        setValidationData(response);
        if (onReferralValidated) {
          onReferralValidated(response);
        }
      } else {
        setError('Invalid referral code');
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setError('Failed to validate referral code');
    } finally {
      setLoading(false);
    }
  };
  
  if (!referralCode) return null;
  
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-blue-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-sm">!</span>
          </div>
          <div>
            <p className="font-medium text-red-900">Invalid Referral Code</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!validationData) return null;
  
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Gift className="w-6 h-6 text-green-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            🎉 You've been invited by {validationData.referrer_name}!
          </h3>
          
          <p className="text-green-700 mb-4">
            Great news! You'll get special rewards for joining through this referral.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Your Rewards */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <h4 className="font-semibold text-gray-900">Your Rewards</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {validationData.rewards.referee.description}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Applied after your first tournament
                </li>
              </ul>
            </div>
            
            {/* Referrer Rewards */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold text-gray-900">{validationData.referrer_name} Gets</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {validationData.rewards.referrer.description}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  When you complete your first tournament
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>💡 Pro Tip:</strong> Complete your first tournament to unlock all rewards for both you and {validationData.referrer_name}!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSignup;