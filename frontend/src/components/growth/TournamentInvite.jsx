import React, { useState } from 'react';
import { UserPlus, X, Send, Users, Mail, Phone } from 'lucide-react';
import { generateInvitationMessage } from '../../utils/socialSharing';

const TournamentInvite = ({ tournament, user, onInvitesSent }) => {
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteContacts, setInviteContacts] = useState([]);
  const [customMessage, setCustomMessage] = useState('');
  const [newContact, setNewContact] = useState({ email: '', phone: '', name: '' });
  const [sending, setSending] = useState(false);
  
  const defaultMessage = `Hey! I'm playing in ${tournament.name} on ${new Date(tournament.date).toLocaleDateString()}. Want to join? It's going to be fun! 🏸`;
  
  const addContact = () => {
    if (newContact.email || newContact.phone) {
      setInviteContacts([...inviteContacts, { ...newContact, id: Date.now() }]);
      setNewContact({ email: '', phone: '', name: '' });
    }
  };
  
  const removeContact = (id) => {
    setInviteContacts(inviteContacts.filter(contact => contact.id !== id));
  };
  
  const sendInvitations = async () => {
    if (inviteContacts.length === 0) {
      alert('Please add at least one contact to invite');
      return;
    }
    
    setSending(true);
    
    try {
      const invitations = inviteContacts.map(contact => ({
        tournament_id: tournament.tournament_id,
        inviter_id: user.user_id,
        invitee_email: contact.email,
        invitee_phone: contact.phone,
        invitee_name: contact.name,
        message: customMessage || defaultMessage
      }));
      
      const response = await fetch('/api/tournaments/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ invitations })
      });
      
      if (response.ok) {
        // Track viral coefficient
        if (window.gtag) {
          window.gtag('event', 'tournament_invite_sent', {
            tournament_id: tournament.tournament_id,
            invite_count: invitations.length
          });
        }
        
        setInviteModal(false);
        setInviteContacts([]);
        setCustomMessage('');
        
        if (onInvitesSent) {
          onInvitesSent(invitations.length);
        }
        
        alert(`Invitations sent to ${invitations.length} contacts!`);
      } else {
        const error = await response.json();
        alert(`Failed to send invitations: ${error.message}`);
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('Failed to send invitations');
    } finally {
      setSending(false);
    }
  };
  
  const invitationPreview = generateInvitationMessage(tournament, user.name, customMessage);
  
  return (
    <>
      <button
        onClick={() => setInviteModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Invite Friends
      </button>
      
      {inviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                Invite Friends to {tournament.name}
              </h3>
              <button 
                onClick={() => setInviteModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={sending}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Tournament Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">{tournament.name}</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>📅 {new Date(tournament.date).toLocaleDateString()}</p>
                  <p>📍 {tournament.venue}</p>
                  <p>💰 Entry: ₹{tournament.entry_fee} | Prize: ₹{tournament.prize_money}</p>
                </div>
              </div>
              
              {/* Add Contacts */}
              <div>
                <h4 className="font-semibold mb-3">Add Contacts to Invite</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Name (optional)"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  onClick={addContact}
                  disabled={!newContact.email && !newContact.phone}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Contact
                </button>
              </div>
              
              {/* Contact List */}
              {inviteContacts.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Contacts to Invite ({inviteContacts.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {inviteContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{contact.name || 'Unknown'}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {contact.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {contact.email}
                                </span>
                              )}
                              {contact.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {contact.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeContact(contact.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Custom Message */}
              <div>
                <h4 className="font-semibold mb-3">Invitation Message</h4>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={defaultMessage}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Leave empty to use the default message
                </p>
              </div>
              
              {/* Message Preview */}
              <div>
                <h4 className="font-semibold mb-3">Message Preview</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium mb-2">{invitationPreview.subject}</p>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {invitationPreview.body}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-600">
                  {inviteContacts.length} contact{inviteContacts.length !== 1 ? 's' : ''} will be invited
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setInviteModal(false)}
                    disabled={sending}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendInvitations}
                    disabled={sending || inviteContacts.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Invitations
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TournamentInvite;