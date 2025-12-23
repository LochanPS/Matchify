import React, { useState, useEffect } from 'react';
import { Users, Gift, Share2, Copy, Check, TrendingUp } from 'lucide-react';
import SocialShareModal from '../common/SocialShareModal';
import { generateShareContent } from '../../utils/socialSharing';
import api from '../../services/api';

const ReferralDashboard = () => {
  const [referralData, setReferralData] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchReferralData();
  }, []);
  
  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      const [codeResponse, statsResponse, rewardsResponse] = await Promise.all([
        fetch('/api/referrals/my-code', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch('/api/referrals/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch('/api/referrals/rewards', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
      ]);
      
      if (codeResponse.ok) {
        const codeData = await codeResponse.json();
        setReferralData(codeData);
      }
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setReferralStats(statsData);
      }
      
      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        setRewards(rewardsData.rewards || []);
      }
      
    } catch (error) {
      console.error('Error fetching referral data:', error);
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };
  
  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralData.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralData.share_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  const shareReferral = () => {
    const shareData = generateShareContent('referral', {
      referral_code: referralData.referral_code
    });
    setShareModal(true);
  };
  
  const applyReward = async (rewardId) => {
    try {
      const response = await fetch(`/api/referrals/rewards/${rewardId}/apply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Reward applied: ${result.reward.description}`);
        fetchReferralData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Failed to apply reward: ${error.message}`);
      }
    } catch (error) {
      console.error('Error applying reward:', error);
      alert('Failed to apply reward');
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Program</h1>
        <p className="text-gray-600">
          Invite friends and earn rewards! Both you and your friends get benefits.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Total Referrals</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {referralData?.statistics?.total_referrals || 0}
          </p>
          <p className="text-sm text-gray-600">Friends invited</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Successful</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {referralData?.statistics?.completed_referrals || 0}
          </p>
          <p className="text-sm text-gray-600">Completed signups</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-6 h-6 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Rewards Earned</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {rewards.filter(r => r.status === 'applied').length}
          </p>
          <p className="text-sm text-gray-600">Applied rewards</p>
        </div>
      </div>
      
      {/* Referral Code Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Referral Code</h2>
        
        <div className="space-y-4">
          {/* Referral Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-50 border rounded-lg font-mono text-lg">
                {referralData?.referral_code}
              </div>
              <button
                onClick={copyReferralCode}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Referral Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-50 border rounded-lg text-sm break-all">
                {referralData?.share_url}
              </div>
              <button
                onClick={copyReferralLink}
                className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Share Button */}
          <button
            onClick={shareReferral}
            className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share with Friends
          </button>
        </div>
      </div>
      
      {/* How it Works */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">How it Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold mb-2">Share Your Code</h3>
            <p className="text-sm text-gray-600">
              Share your referral code or link with friends who love badminton
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-green-600">2</span>
            </div>
            <h3 className="font-semibold mb-2">Friend Signs Up</h3>
            <p className="text-sm text-gray-600">
              Your friend uses your code to sign up and gets a free tournament entry
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-orange-600">3</span>
            </div>
            <h3 className="font-semibold mb-2">Both Get Rewards</h3>
            <p className="text-sm text-gray-600">
              You get ₹100 credit and your friend gets a free entry when they play their first tournament
            </p>
          </div>
        </div>
      </div>
      
      {/* Referral History */}
      {referralStats?.referrals && referralStats.referrals.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Referral History</h2>
          
          <div className="space-y-3">
            {referralStats.referrals.map((referral) => (
              <div key={referral.referral_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{referral.referee_name}</p>
                  <p className="text-sm text-gray-600">
                    Joined {new Date(referral.referee_joined_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    referral.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : referral.status === 'rewarded'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {referral.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Pending Rewards */}
      {rewards.filter(r => r.status === 'pending').length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Rewards</h2>
          
          <div className="space-y-3">
            {rewards.filter(r => r.status === 'pending').map((reward) => (
              <div key={reward.reward_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {reward.reward_type === 'tournament_credit' 
                      ? `₹${reward.reward_value} Tournament Credit`
                      : `${reward.reward_value} Free Tournament Entry`
                    }
                  </p>
                  <p className="text-sm text-gray-600">
                    From referral of {reward.related_user_name}
                  </p>
                  {reward.expires_at && (
                    <p className="text-xs text-orange-600">
                      Expires: {new Date(reward.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => applyReward(reward.reward_id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Reward
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      {shareModal && (
        <SocialShareModal
          isOpen={shareModal}
          onClose={() => setShareModal(false)}
          shareData={generateShareContent('referral', {
            referral_code: referralData?.referral_code
          })}
          title="Share Referral Code"
        />
      )}
    </div>
  );
};

export default ReferralDashboard;