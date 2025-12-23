import React, { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import TemplateCard from './TemplateCard';
import QuickCreateForm from './QuickCreateForm';

export default function TemplateSelector({ onTournamentCreated, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [userTemplates, setUserTemplates] = useState([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch templates');

      const data = await response.json();
      setTemplates(data.templates);

      // Separate user templates
      const userId = localStorage.getItem('userId');
      setUserTemplates(data.templates.filter((t) => t.organizer_id === userId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.template_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickCreate = (template) => {
    setSelectedTemplate(template);
  };

  const handleTournamentCreated = (tournament) => {
    onTournamentCreated(tournament);
    onClose();
  };

  if (selectedTemplate) {
    return (
      <QuickCreateForm
        template={selectedTemplate}
        onSuccess={handleTournamentCreated}
        onCancel={() => setSelectedTemplate(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tournament Templates</h2>
        <p className="text-gray-600">
          Choose a template to quickly create a tournament. Customize the details as needed.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No templates found</p>
        </div>
      ) : (
        <>
          {/* Default Templates */}
          {filteredTemplates.filter((t) => t.is_public && !userTemplates.includes(t)).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates
                  .filter((t) => t.is_public && !userTemplates.includes(t))
                  .map((template) => (
                    <TemplateCard
                      key={template.template_id}
                      template={template}
                      onQuickCreate={handleQuickCreate}
                      isOwner={false}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* User Templates */}
          {userTemplates.filter((t) =>
            t.template_name.toLowerCase().includes(searchTerm.toLowerCase())
          ).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userTemplates
                  .filter((t) =>
                    t.template_name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((template) => (
                    <TemplateCard
                      key={template.template_id}
                      template={template}
                      onQuickCreate={handleQuickCreate}
                      isOwner={true}
                    />
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Close Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
