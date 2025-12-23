import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/HelpCenter.css';

const HelpCenter = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [faqItems, setFaqItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [guides, setGuides] = useState([]);
  const [troubleshooting, setTroubleshooting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    category: 'general'
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Fetch FAQ
  const fetchFaq = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/help/faq?${params}`,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch FAQ');
      const data = await response.json();
      setFaqItems(data.faq);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/help/categories`,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch guides
  const fetchGuides = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.role) params.append('role', user.role);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/help/guides?${params}`,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch guides');
      const data = await response.json();
      setGuides(data.guides);
    } catch (err) {
      console.error('Error fetching guides:', err);
    }
  };

  // Fetch troubleshooting
  const fetchTroubleshooting = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/help/troubleshooting`,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch troubleshooting');
      const data = await response.json();
      setTroubleshooting(data.articles);
    } catch (err) {
      console.error('Error fetching troubleshooting:', err);
    }
  };

  // Initial load
  useEffect(() => {
    Promise.all([fetchFaq(), fetchCategories(), fetchGuides(), fetchTroubleshooting()]);
    setLoading(false);
  }, []);

  // Fetch when filters change
  useEffect(() => {
    fetchFaq();
  }, [selectedCategory, searchQuery]);

  // Mark FAQ as helpful
  const markHelpful = async (faqId, helpful) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/help/faq/${faqId}/helpful`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ helpful })
        }
      );
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  };

  // Submit contact form
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/help/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(contactForm)
        }
      );

      if (!response.ok) throw new Error('Failed to submit');
      setContactSubmitted(true);
      setContactForm({ subject: '', message: '', category: 'general' });
      setTimeout(() => setContactSubmitted(false), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="help-loading">Loading help center...</div>;
  }

  return (
    <div className="help-center">
      <div className="help-header">
        <h1>📚 Help Center</h1>
        <p>Find answers and get support</p>
      </div>

      {/* Tab Navigation */}
      <div className="help-tabs">
        <button
          className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          FAQ
        </button>
        <button
          className={`tab-btn ${activeTab === 'guides' ? 'active' : ''}`}
          onClick={() => setActiveTab('guides')}
        >
          Getting Started
        </button>
        <button
          className={`tab-btn ${activeTab === 'troubleshooting' ? 'active' : ''}`}
          onClick={() => setActiveTab('troubleshooting')}
        >
          Troubleshooting
        </button>
        <button
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Support
        </button>
      </div>

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="tab-content">
          <div className="faq-controls">
            <input
              type="text"
              placeholder="🔍 Search FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div className="category-filter">
              <button
                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  className={`category-btn ${selectedCategory === cat.category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.category)}
                >
                  {cat.category} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          <div className="faq-list">
            {faqItems.length === 0 ? (
              <div className="no-results">No FAQ items found</div>
            ) : (
              faqItems.map((item) => (
                <div key={item.id} className="faq-item">
                  <div
                    className="faq-question"
                    onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                  >
                    <span className="faq-icon">
                      {expandedFaq === item.id ? '▼' : '▶'}
                    </span>
                    <span>{item.question}</span>
                  </div>
                  {expandedFaq === item.id && (
                    <div className="faq-answer">
                      <p>{item.answer}</p>
                      <div className="faq-feedback">
                        <span>Was this helpful?</span>
                        <button
                          className="helpful-btn"
                          onClick={() => markHelpful(item.id, true)}
                        >
                          👍 Yes
                        </button>
                        <button
                          className="helpful-btn"
                          onClick={() => markHelpful(item.id, false)}
                        >
                          👎 No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Guides Tab */}
      {activeTab === 'guides' && (
        <div className="tab-content">
          <div className="guides-list">
            {guides.length === 0 ? (
              <div className="no-results">No guides available</div>
            ) : (
              guides.map((guide) => (
                <div key={guide.id} className="guide-card">
                  <h3>{guide.title}</h3>
                  <p>{guide.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Troubleshooting Tab */}
      {activeTab === 'troubleshooting' && (
        <div className="tab-content">
          <div className="troubleshooting-list">
            {troubleshooting.length === 0 ? (
              <div className="no-results">No troubleshooting articles found</div>
            ) : (
              troubleshooting.map((article) => (
                <div key={article.id} className="troubleshooting-card">
                  <h3>{article.title}</h3>
                  {article.category && (
                    <span className="category-tag">{article.category}</span>
                  )}
                  <p>{article.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Contact Support Tab */}
      {activeTab === 'contact' && (
        <div className="tab-content">
          {user ? (
            <div className="contact-form-container">
              <h2>Contact Support</h2>
              {contactSubmitted && (
                <div className="success-message">
                  ✅ Thank you! Your support ticket has been created. We'll get back to you soon.
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={contactForm.category}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, category: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="general">General Question</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="payment">Payment Issue</option>
                    <option value="account">Account Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, subject: e.target.value })
                    }
                    placeholder="Brief subject of your issue"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, message: e.target.value })
                    }
                    placeholder="Describe your issue in detail..."
                    className="form-textarea"
                    rows="6"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Submit Support Ticket
                </button>
              </form>
            </div>
          ) : (
            <div className="login-prompt">
              <p>Please log in to contact support</p>
            </div>
          )}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default HelpCenter;
