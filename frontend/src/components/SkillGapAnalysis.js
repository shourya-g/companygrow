import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, TrendingUp, Star } from 'lucide-react';

const SkillGapAnalysis = ({ skillGaps = [], skillStrengths = [], isExpanded = false }) => {
  const [expanded, setExpanded] = useState(isExpanded);

  const getGapSeverity = (gap) => {
    if (gap >= 3) return { color: 'text-red-600 bg-red-100', text: 'Critical' };
    if (gap >= 2) return { color: 'text-orange-600 bg-orange-100', text: 'High' };
    if (gap >= 1) return { color: 'text-yellow-600 bg-yellow-100', text: 'Medium' };
    return { color: 'text-green-600 bg-green-100', text: 'Low' };
  };

  const getStrengthLevel = (surplus) => {
    if (surplus >= 3) return { color: 'text-green-600 bg-green-100', text: 'Expert+' };
    if (surplus >= 2) return { color: 'text-blue-600 bg-blue-100', text: 'Advanced+' };
    if (surplus >= 1) return { color: 'text-indigo-600 bg-indigo-100', text: 'Proficient+' };
    return { color: 'text-gray-600 bg-gray-100', text: 'Meets req.' };
  };

  if (skillGaps.length === 0 && skillStrengths.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No skill analysis available
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left font-medium text-gray-700 rounded-t-lg"
        onClick={() => setExpanded(!expanded)}
      >
        <span>Skill Analysis</span>
        <div className="flex items-center space-x-2">
          {skillGaps.length > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
              {skillGaps.length} gap{skillGaps.length !== 1 ? 's' : ''}
            </span>
          )}
          {skillStrengths.length > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              {skillStrengths.length} strength{skillStrengths.length !== 1 ? 's' : ''}
            </span>
          )}
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Skill Gaps */}
          {skillGaps.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                <h4 className="font-medium text-gray-900">Skill Gaps</h4>
              </div>
              <div className="space-y-2">
                {skillGaps.map((gap, index) => {
                  const severity = getGapSeverity(gap.gap);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{gap.skill}</span>
                          {gap.is_mandatory && (
                            <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Has level {gap.user_level}, needs level {gap.required_level}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${severity.color} font-medium`}>
                        Gap: {gap.gap} level{gap.gap !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skill Strengths */}
          {skillStrengths.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Skill Strengths</h4>
              </div>
              <div className="space-y-2">
                {skillStrengths.map((strength, index) => {
                  const level = getStrengthLevel(strength.surplus);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-green-600 mr-1" />
                          <span className="font-medium text-gray-900">{strength.skill}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Has level {strength.user_level}, required level {strength.required_level}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${level.color} font-medium`}>
                        +{strength.surplus} level{strength.surplus !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No gaps or strengths */}
          {skillGaps.length === 0 && skillStrengths.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <Star className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Perfect skill match - no gaps or surplus skills</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;