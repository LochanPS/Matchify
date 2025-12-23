import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, ExternalLink } from 'lucide-react';
import { communityAPI } from '../../services/api';

const EventCalendar = ({ city }) => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvpLoading, setRsvpLoading] = useState({});
  
  const eventTypes = ['All', 'Meetup', 'Workshop', 'Social', 'Tournament'];
  
  useEffect(() => {
    fetchEvents();
  }, [city, selectedDate, selectedType]);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const filters = {
        city: city || '',
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear()
      };
      
      if (selectedType !== 'All') {
        filters.type = selectedType;
      }
      
      const data = await communityAPI.getEvents(filters);
      
      if (data.success) {
        setEvents(data.events || []);
      } else {
        setError('Failed to load events');
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Failed to load events');
      
      // Set mock data for demonstration
      const mockEvents = [
        {
          event_id: '1',
          title: 'Weekend Badminton Meetup',
          description: 'Join us for a fun weekend session! All skill levels welcome. Bring your racket and enthusiasm!',
          event_type: 'meetup',
          start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Sports Complex, Bandra',
          city: city || 'Mumbai',
          max_attendees: 20,
          current_attendees: 12,
          is_online: false,
          organizer_name: 'Rahul Kumar'
        },
        {
          event_id: '2',
          title: 'Doubles Strategy Workshop',
          description: 'Learn advanced doubles techniques and strategies from certified coaches.',
          event_type: 'workshop',
          start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Badminton Academy, Andheri',
          city: city || 'Mumbai',
          max_attendees: 15,
          current_attendees: 8,
          is_online: false,
          organizer_name: 'Priya Sharma'
        },
        {
          event_id: '3',
          title: 'New Year Social Tournament',
          description: 'Celebrate the new year with a friendly tournament followed by dinner!',
          event_type: 'tournament',
          start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Club House, Powai',
          city: city || 'Mumbai',
          max_attendees: 32,
          current_attendees: 28,
          is_online: false,
          organizer_name: 'Amit Patel'
        }
      ];
      
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRSVP = async (eventId, status) => {
    try {
      setRsvpLoading(prev => ({ ...prev, [eventId]: true }));
      
      const data = await communityAPI.rsvpEvent(eventId, status);
      
      if (data.success) {
        fetchEvents(); // Refresh events
      } else {
        alert(data.message || 'Failed to update RSVP');
      }
    } catch (error) {
      console.error('Failed to RSVP:', error);
      alert('Failed to update RSVP');
    } finally {
      setRsvpLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };
  
  const EventCard = ({ event }) => {
    const eventDate = new Date(event.start_date);
    const isOnline = event.is_online;
    const isFull = event.max_attendees && event.current_attendees >= event.max_attendees;
    
    const getEventTypeColor = (type) => {
      const colors = {
        meetup: 'bg-blue-100 text-blue-700',
        workshop: 'bg-green-100 text-green-700',
        social: 'bg-purple-100 text-purple-700',
        tournament: 'bg-orange-100 text-orange-700'
      };
      return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-700';
    };
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          {/* Date Badge */}
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-xs text-blue-600 font-medium">
              {eventDate.toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className="text-lg font-bold text-blue-600">
              {eventDate.getDate()}
            </span>
          </div>
          
          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2 ${getEventTypeColor(event.event_type)}`}>
                {event.event_type}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
            
            {/* Event Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {eventDate.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
              
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {isOnline ? 'Online Event' : event.location}
              </span>
              
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {event.current_attendees}/{event.max_attendees || '∞'} attending
              </span>
              
              {isFull && (
                <span className="text-red-600 font-medium">FULL</span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRSVP(event.event_id, 'going')}
                disabled={rsvpLoading[event.event_id] || isFull}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {rsvpLoading[event.event_id] ? 'Updating...' : isFull ? 'Full' : 'Join Event'}
              </button>
              
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Details
              </button>
              
              {isOnline && event.meeting_link && (
                <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors">
                  Join Online
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Events</h2>
          <p className="text-gray-600 mt-1">
            Join local meetups, workshops, and social events
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>
      
      {/* Event Type Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {eventTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      
      {/* Events List */}
      {error ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Unable to Load Events</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-4">
          {events.map(event => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Events Found</h3>
          <p className="text-gray-500 mb-4">
            {selectedType === 'All' 
              ? `No upcoming events in ${city || 'your area'} this month.`
              : `No ${selectedType.toLowerCase()} events found.`
            }
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create the First Event
          </button>
        </div>
      )}
      
      {/* Event Creation Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">💡 Event Ideas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-900 mb-1">🏸 Practice Sessions</p>
            <p className="text-gray-600">Organize regular practice meetups for skill improvement</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">🎓 Technique Workshops</p>
            <p className="text-gray-600">Learn new techniques from experienced players</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">🍕 Social Gatherings</p>
            <p className="text-gray-600">Build friendships beyond the court</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">🏆 Mini Tournaments</p>
            <p className="text-gray-600">Friendly competitions for all skill levels</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;