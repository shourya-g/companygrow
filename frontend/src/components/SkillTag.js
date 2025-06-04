import React from 'react';

// Heroicons outline minus icon
const MinusIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
);

const SkillTag = ({ skill, onRemove, removable }) => {
  // Safety check for skill object
  if (!skill || !skill.name) {
    return null;
  }

  return (
    <span className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2 mb-2 group cursor-pointer hover:bg-blue-200 transition">
      {skill.name}
      {removable && onRemove && (
        <button
          type="button"
          onClick={e => { 
            e.stopPropagation(); 
            onRemove(skill); 
          }}
          className="ml-1 text-blue-500 hover:text-red-500 opacity-60 group-hover:opacity-100 focus:outline-none transition-colors"
          title="Remove skill"
        >
          <MinusIcon />
        </button>
      )}
    </span>
  );
};

export default SkillTag;