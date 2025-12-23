import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Star, MessageCircle, Calendar, Award, UserCheck, Search } from 'lucide-react';

const MentorshipProgram = () => {
  const [mentors, setMentors] = useState([]);
  const [isMentor, setIsMentor] = useState(false);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('find');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  useEffect(() => {
    fetchMentorshipData();
  }, []);

  const fetchMentorshipData = async () => {
    try {
      // Mock data for demonstration
      const mockMentors = [
        {
          id: 1,
          name: 'Rajesh Kumar',
          experience: '5+ years',
          specialties: ['Singles', 'Tournament Strategy', 'Mental Game'],
          rating: 4.9,
          sessions: 23,
          bio: 'Former state-level player with extensive tournament experience. Specializes in helping players develop winning strategies.',
          availability: 'Weekends',
          city: 'Mumbai',
          languages: ['English', 'Hindi'],
          achievements: ['State Champion 2019', 'District Coach'],
          hourlyRate: 'Free',
          responseTime: '< 2 hours'
        },
        {
          id: 2,
          name: 'Priya Sharma',
          experience: '3+ years',
          specialties: ['Doubles', 'Technique', 'Footwork'],
          rating: 4.8,
          sessions: 15,
          bio: 'Professional coach focusing on technical excellence and doubles strategy. Great with beginners and intermediate players.',
          availability: 'Evenings',
          city: 'Delhi',
          languages: ['English', 'Hindi', 'Punjabi'],
          achievements: ['Certified Coach', 'Club Champion'],
          hourlyRate: 'Free',
          responseTime: '< 4 hours'
        },
        {
          id: 3,
          name: 'Amit Patel',
          experience: '7+ years',
          specialties: ['Advanced Techniques', 'Competition Prep', 'Fitness'],
          rating: 4.9,
          sessions: 45,
          bio: 'Elite player and certified trainer. Helps advanced players reach their competitive potential.',
          availability: 'Flexible',
          city: 'Bangalore',
          languages: ['English', 'Hindi', 'Gujarati'],
          achievements: ['National Level Player', 'BWF Certified'],
          hourlyRate: 'Free',
          responseTime: '< 1 hour'
        }
      ];

      setMentors(mockMentors);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch mentorship data:', error);
      setLoading(false);
    }
  };

  const specialties = ['all', 'Singles', 'Doubles', 'Technique', 'Tournament Strategy', 'Mental Game', 'Fitness'];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialty = selectedSpecialty === 'all' || mentor.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mentorship Program</h2>
            <p className="text-gray-600">Connect with experienced players to accelerate your badminton journey</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <button 
            onClick={() => setActiveTab('find')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'find' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Find a Mentor
          </button>
          <button 
            onClick={() => setActiveTab('become')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'become' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-purple-600 hover:bg-purple-50'
            }`}
          >
            <UserCheck className="w-4 h-4 inline mr-2" />
            Become a Mentor
          </button>
          <button 
            onClick={() => setActiveTab('my-sessions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'my-sessions' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-green-600 hover:bg-green-50'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            My Sessions
          </button>
        </div>
      </div>

      {/* Find Mentors Tab */}
      {activeTab === 'find' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Mentors</label>
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty === 'all' ? 'All Specialties' : specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMentors.map(mentor => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>

          {filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Become a Mentor Tab */}
      {activeTab === 'become' && (
        <BecomeMentorForm />
      )}

      {/* My Sessions Tab */}
      {activeTab === 'my-sessions' && (
        <MySessionsView />
      )}
    </div>
  );
};

const MentorCard = ({ mentor }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {mentor.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{mentor.name}</h3>
          <p className="text-sm text-gray-600">{mentor.experience} experience • {mentor.city}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{mentor.rating}</span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-600">{mentor.sessions} sessions</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-green-600 font-medium">{mentor.hourlyRate}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{mentor.bio}</p>

      {/* Specialties */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Specialties:</p>
        <div className="flex flex-wrap gap-1">
          {mentor.specialties.map((specialty, index) => (
            <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Availability:</span>
          <p className="font-medium">{mentor.availability}</p>
        </div>
        <div>
          <span className="text-gray-500">Response Time:</span>
          <p className="font-medium">{mentor.responseTime}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
        <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
          <MessageCircle className="w-4 h-4" />
          Connect
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Languages</h4>
            <p className="text-sm text-gray-600">{mentor.languages.join(', ')}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Achievements</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {mentor.achievements.map((achievement, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Award className="w-3 h-3 text-yellow-500" />
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const BecomeMentorForm = () => {
  const [formData, setFormData] = useState({
    experience: '',
    specialties: [],
    bio: '',
    availability: '',
    languages: []
  });

  const specialtyOptions = ['Singles', 'Doubles', 'Technique', 'Tournament Strategy', 'Mental Game', 'Fitness', 'Equipment'];
  const languageOptions = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada'];

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Become a Mentor</h3>
      <p className="text-gray-600 mb-6">Share your knowledge and help other players improve their game</p>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
          <select
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select your experience</option>
            <option value="1-2 years">1-2 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5+ years">5+ years</option>
            <option value="10+ years">10+ years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {specialtyOptions.map(specialty => (
              <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.specialties.includes(specialty)}
                  onChange={() => handleSpecialtyToggle(specialty)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{specialty}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell others about your badminton journey and what you can help with..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
          <select
            value={formData.availability}
            onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select your availability</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekends">Weekends</option>
            <option value="Evenings">Evenings</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {languageOptions.map(language => (
              <label key={language} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(language)}
                  onChange={() => handleLanguageToggle(language)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{language}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
};

const MySessionsView = () => {
  const mockSessions = [
    {
      id: 1,
      mentorName: 'Rajesh Kumar',
      date: '2024-12-22',
      time: '10:00 AM',
      status: 'upcoming',
      topic: 'Tournament Strategy'
    },
    {
      id: 2,
      mentorName: 'Priya Sharma',
      date: '2024-12-18',
      time: '6:00 PM',
      status: 'completed',
      topic: 'Doubles Technique'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">My Mentorship Sessions</h3>
      
      {mockSessions.length > 0 ? (
        <div className="space-y-3">
          {mockSessions.map(session => (
            <div key={session.id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{session.topic}</h4>
                  <p className="text-sm text-gray-600">with {session.mentorName}</p>
                  <p className="text-sm text-gray-500">{session.date} at {session.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  session.status === 'upcoming' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {session.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
          <p className="text-gray-600">Connect with a mentor to schedule your first session</p>
        </div>
      )}
    </div>
  );
};

export default MentorshipProgram;