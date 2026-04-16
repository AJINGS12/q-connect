import React from 'react';

const LoadingJourney: React.FC = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-light">
      <div className="relative">
        {/* Soft pulsing aura */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        
        {/* Your Logo (Placeholder for now) */}
        <div className="relative text-4xl font-display font-bold text-primary italic mb-8">
          QConnect
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <p className="text-secondary font-display italic animate-bounce">
          Preparing your journey...
        </p>
        <div className="w-48 h-1 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-progress" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingJourney;