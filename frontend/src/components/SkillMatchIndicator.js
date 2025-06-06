import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const SkillMatchIndicator = ({ 
  matchPercentage, 
  isQualified, 
  size = 'md', 
  showText = true,
  className = '' 
}) => {
  const getMatchColor = () => {
    if (matchPercentage >= 90) return 'text-green-600 bg-green-100';
    if (matchPercentage >= 70) return 'text-blue-600 bg-blue-100';
    if (matchPercentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMatchIcon = () => {
    if (isQualified && matchPercentage >= 90) return CheckCircle;
    if (isQualified) return Info;
    if (matchPercentage >= 50) return AlertTriangle;
    return XCircle;
  };

  const getMatchText = () => {
    if (matchPercentage >= 90) return 'Excellent match';
    if (matchPercentage >= 70) return 'Good match';
    if (matchPercentage >= 50) return 'Fair match';
    return 'Poor match';
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

  const IconComponent = getMatchIcon();

  return (
    <div className={`inline-flex items-center rounded-full ${getMatchColor()} ${getSizeClasses()} ${className}`}>
      <IconComponent className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
      <span className="font-medium">{matchPercentage}%</span>
      {showText && (
        <span className="ml-1">
          {getMatchText()}
        </span>
      )}
      {isQualified && (
        <span className="ml-1 text-xs font-semibold">
          ✓ Qualified
        </span>
      )}
    </div>
  );
};

export default SkillMatchIndicator;