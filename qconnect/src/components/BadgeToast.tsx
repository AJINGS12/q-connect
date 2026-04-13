import React, { useEffect, useState } from 'react';
import { Sparkles, Award } from 'lucide-react';

interface BadgeToastProps {
  badgeName: string;
  badgeIcon: string;
  onClose: () => void;
}

const BadgeToast: React.FC<BadgeToastProps> = ({ badgeName, badgeIcon, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto-hide after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-8 duration-700">
      <div className="bg-white border-2 border-[#00695C] rounded-[24px] p-4 pr-8 shadow-2xl flex items-center gap-4 min-w-[300px]">
        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl shadow-inner">
          {badgeIcon}
        </div>
        <div>
          <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-0.5 flex items-center gap-1">
            <Sparkles size={10} /> Achievement Unlocked
          </p>
          <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-tight">
            {badgeName}
          </h3>
        </div>
        <div className="ml-auto opacity-20">
          <Award size={20} />
        </div>
      </div>
    </div>
  );
};

export default BadgeToast;