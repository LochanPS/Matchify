import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else {
        throw new Error('Failed to fetch preferences');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading preferences...</div>;
  }

  if (!preferences) {
    return <div className="text-center py-8 text-red-600">Failed to load preferences</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Notification Preferences
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Preferences saved successfully!</p>
        </div>
      )}

      {/* Email Notifications */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📧 Email Notifications
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_tournaments}
              onChange={() => handleToggle('email_tournaments')}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Tournament updates</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_matches}
              onChange={() => handleToggle('email_matches')}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Match notifications</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_payments}
              onChange={() => handleToggle('email_payments')}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Payment confirmations</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_community}
              onChange={() => handleToggle('email_community')}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Community updates</span>
          </label>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📱 SMS Notifications
        </h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.sms_enabled}
            onChange={() => handleToggle('sms_enabled')}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-gray-700">Enable SMS alerts</span>
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Receive important alerts via SMS (match reminders, payment confirmations)
        </p>
      </div>

      {/* Push Notifications */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔔 Push Notifications
        </h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.push_enabled}
            onChange={() => handleToggle('push_enabled')}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-gray-700">Enable push notifications</span>
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Receive browser notifications for important updates
        </p>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        <button
          onClick={fetchPreferences}
          disabled={saving}
          className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
