import { useState, useEffect, useRef, useCallback } from 'react';
import { Footprints, Crown } from 'lucide-react';
import loadingVideo from '../assets/images/Loading-Screen-Video.mp4';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing Locker...');
  const videoRef = useRef<HTMLVideoElement>(null);
  const duration = 8000; // Matches the uploaded video duration (8.04s) perfectly

  const videoSources = [
    '/Loading-Screen-Video.mp4',
    loadingVideo,
    '/src/assets/images/Loading-Screen-Video.mp4',
    '/assets/images/Loading-Screen-Video.mp4'
  ];
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(calculatedProgress);

      // Dynamic text updates for a premium, immersive feel
      if (calculatedProgress < 25) {
        setLoadingText('Initializing Locker...');
      } else if (calculatedProgress < 50) {
        setLoadingText('Loading Sneaker Collection...');
      } else if (calculatedProgress < 75) {
        setLoadingText('Balancing the Roulette Wheel...');
      } else if (calculatedProgress < 95) {
        setLoadingText('Polishing the Kicks...');
      } else {
        setLoadingText('Ready to Spin!');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleVideoError = useCallback(() => {
    if (sourceIndex < videoSources.length - 1) {
      setSourceIndex(prev => prev + 1);
    } else {
      setVideoError(true);
    }
  }, [sourceIndex, videoSources.length]);

  // Attempt to play the video if it's available
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((error) => {
        // Do NOT trigger fallback error state on autoplay restriction or play interrupts.
        // The HTML5 video element will load and display/play when possible.
        console.warn("Autoplay was prevented or interrupted: ", error);
      });
    }
  }, [sourceIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Immersive background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="w-full max-w-2xl flex flex-col items-center z-10 gap-6">
        {/* Video Wrapper / Fallback Animation */}
        <div className="relative w-full aspect-video bg-zinc-900/50 rounded-3xl border border-zinc-800/40 overflow-hidden shadow-2xl shadow-red-500/5 flex items-center justify-center">
          {!videoError ? (
            <video
              ref={videoRef}
              src={videoSources[sourceIndex]}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              onError={handleVideoError}
            />
          ) : (
            /* Sleek, premium loading placeholder while the video loads or if absent */
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 text-center">
              <div className="relative flex items-center justify-center w-20 h-20 mb-4">
                <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-red-500/20 animate-pulse" />
                <div className="relative p-4 bg-zinc-900 border border-zinc-800 rounded-full text-red-500 shadow-xl">
                  <Footprints className="w-8 h-8 animate-bounce" />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-amber-500 fill-amber-500/20 transform -rotate-12 animate-pulse" />
                <span className="font-sans font-black tracking-tight text-xl text-zinc-100 uppercase">
                  Sneaker <span className="text-red-500">Roulette</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500">Loading your luxury locker...</p>
            </div>
          )}
        </div>

        {/* Progress and Loading Text Section */}
        <div className="w-full max-w-md flex flex-col items-center gap-3">
          {/* Progress Bar with rounded edges, going from rose-400 at 0% to emerald-500 at 100% */}
          <div className="w-full h-2.5 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-[2px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 to-emerald-500 transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="w-full flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
              {loadingText}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400/80">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
