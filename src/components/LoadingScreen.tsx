import { useEffect, useState } from 'react';
import { Code2 } from 'lucide-react';

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    const duration = 1800;
    const interval = 16;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const t = currentStep / steps;
      // Use easeInOut cubic for a smoother, premium feel
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const newProgress = Math.min(Math.round(eased * 100), 100);
      setProgress(newProgress);
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Main content */}
      <div 
        className="relative z-10 flex flex-col items-center transition-all duration-1000 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)'
        }}
      >
        {/* Static Logo with soft glow */}
        <div className="mb-6 sm:mb-8">
          <div 
            className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20 relative"
            style={{ 
              boxShadow: '0 8px 32px rgba(193, 98, 45, 0.15)'
            }}
          >
            <Code2 size={32} className="sm:hidden" strokeWidth={1.5} />
            <Code2 size={38} className="hidden sm:block" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-main mb-2 tracking-tight">
          CodeNest
        </h1>
        <p className="text-text-muted text-xs sm:text-sm font-medium tracking-[0.18em] sm:tracking-widest uppercase mb-8 sm:mb-10">
          Your Code Vault
        </p>

        {/* Progress */}
        <div className="w-[min(16rem,78vw)] flex flex-col items-center gap-3 sm:gap-4">
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary"
              style={{ 
                width: `${progress}%`,
                transition: 'width 16ms linear' 
              }}
            />
          </div>
          <span className="text-sm font-mono font-semibold text-primary tracking-wider">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};
