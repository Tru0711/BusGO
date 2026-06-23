import React from 'react';

type Props = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
};

export const StatsCard: React.FC<Props> = ({ title, value, icon, className }) => {
  return (
    <div className={`p-4 rounded-xl glass shadow-sm flex items-center gap-4 ${className || ''}`}>
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-lg">
        {icon ?? '★'}
      </div>
      <div>
        <div className="text-xs text-gray-600">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </div>
  );
};

export default StatsCard;
