import React from 'react';
import { Copy, Edit2, Trash2, Zap } from 'lucide-react';

export default function TemplateCard({
  template,
  onQuickCreate,
  onEdit,
  onDuplicate,
  onDelete,
  isOwner,
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
          {template.description && (
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          )}
        </div>
        {template.is_public && (
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
            Public
          </span>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className="text-gray-600">Format:</span>
          <p className="font-medium text-gray-900 capitalize">{template.format}</p>
        </div>
        <div>
          <span className="text-gray-600">Match Type:</span>
          <p className="font-medium text-gray-900 capitalize">{template.match_type}</p>
        </div>
        <div>
          <span className="text-gray-600">Max Players:</span>
          <p className="font-medium text-gray-900">{template.max_players}</p>
        </div>
        <div>
          <span className="text-gray-600">Entry Fee:</span>
          <p className="font-medium text-gray-900">
            {template.entry_fee > 0 ? `₹${template.entry_fee}` : 'Free'}
          </p>
        </div>
      </div>

      {/* Usage Stats */}
      {template.usage_count > 0 && (
        <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-600">
          Used {template.usage_count} time{template.usage_count !== 1 ? 's' : ''}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onQuickCreate(template)}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Quick Create
        </button>

        {isOwner && (
          <>
            <button
              onClick={() => onEdit(template)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit template"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(template)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Duplicate template"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(template)}
              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete template"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
