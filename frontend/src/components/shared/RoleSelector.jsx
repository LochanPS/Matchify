import { User, Users, Check } from 'lucide-react';

const RoleSelector = ({ selectedRole, onSelect }) => {
  const roles = [
    {
      id: 'player',
      icon: User,
      title: 'Player',
      description: 'Join tournaments and track your stats'
    },
    {
      id: 'organizer',
      icon: Users,
      title: 'Organizer',
      description: 'Create and manage tournaments'
    }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        I am a...
      </label>
      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelect(role.id)}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
              <div className="text-left">
                <div className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                  {role.title}
                </div>
                <div className="text-xs text-gray-500">
                  {role.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
