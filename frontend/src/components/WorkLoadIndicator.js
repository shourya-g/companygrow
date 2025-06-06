import React from 'react';
import { Clock, Users, AlertCircle } from 'lucide-react';

const WorkloadIndicator = ({ 
  currentProjects, 
  availabilityScore, 
  activeAssignments = [],
  size = 'md',
  detailed = false 
}) => {
  const getWorkloadColor = () => {
    if (currentProjects === 0) return 'text-green-600 bg-green-100';
    if (currentProjects <= 2) return 'text-blue-600 bg-blue-100';
    if (currentProjects <= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getWorkloadText = () => {
    if (currentProjects === 0) return 'Available';
    if (currentProjects === 1) return 'Light load';
    if (currentProjects <= 2) return 'Moderate load';
    if (currentProjects <= 4) return 'Heavy load';
    return 'Overloaded';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1';
    }
  };

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center rounded-full ${getWorkloadColor()} ${getSizeClasses()}`}>
        <Users className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        <span className="font-medium">{currentProjects} project{currentProjects !== 1 ? 's' : ''}</span>
        <span className="ml-1">{getWorkloadText()}</span>
      </div>
      
      {detailed && (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>Availability: {availabilityScore}%</span>
          </div>
          
          {activeAssignments.length > 0 && (
            <div className="mt-2">
              <div className="font-medium text-gray-700 mb-1">Current projects:</div>
              <div className="space-y-1">
                {activeAssignments.map((assignment, index) => (
                  <div key={index} className="text-xs bg-gray-100 rounded px-2 py-1">
                    <span className="font-medium">{assignment.Project?.name}</span>
                    {assignment.Project?.priority && (
                      <span className={`ml-2 px-1 rounded text-xs ${
                        assignment.Project.priority === 'high' ? 'bg-red-100 text-red-700' :
                        assignment.Project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {assignment.Project.priority}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkloadIndicator;