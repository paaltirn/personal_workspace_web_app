'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, X, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PomodoroTheme = 'dopamine' | 'minimal' | 'candy';

interface ThemeConfig {
  name: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  buttonClass: string;
  progressColor: string;
}

const themes: Record<PomodoroTheme, ThemeConfig> = {
  dopamine: {
    name: '多巴胺',
    bgGradient: 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500',
    textColor: 'text-white',
    accentColor: 'text-yellow-300',
    buttonClass: 'bg-white/20 hover:bg-white/30 border-white/20',
    progressColor: 'from-yellow-400 to-pink-400'
  },
  minimal: {
    name: '极简',
    bgGradient: 'bg-gray-50',
    textColor: 'text-gray-900',
    accentColor: 'text-blue-600',
    buttonClass: 'bg-gray-900 text-white hover:bg-gray-800',
    progressColor: 'from-gray-400 to-gray-600'
  },
  candy: {
    name: '糖果',
    bgGradient: 'bg-gradient-to-br from-rose-300 via-fuchsia-300 to-indigo-300',
    textColor: 'text-white',
    accentColor: 'text-yellow-200',
    buttonClass: 'bg-white/30 hover:bg-white/40 border-white/20 backdrop-blur-sm',
    progressColor: 'from-cyan-400 to-purple-400'
  }
};

const POMODORO_MINUTES = 25;

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(POMODORO_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<PomodoroTheme>('dopamine');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const theme = themes[currentTheme];
  const totalSeconds = POMODORO_MINUTES * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeLeft === 0 && isRunning) {
        setIsRunning(false);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleThemeChange = (theme: PomodoroTheme) => {
    setCurrentTheme(theme);
    setShowThemeSelector(false);
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center h-full w-full transition-all duration-500",
      theme.bgGradient,
      isFullScreen ? "fixed inset-0 z-50 min-h-screen" : "relative"
    )}>
      <div className={cn("absolute top-4 right-4 z-10", isFullScreen ? "top-8 right-8" : "")}>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full backdrop-blur-sm transition-all",
              theme.buttonClass,
              theme.textColor
            )}
            onClick={() => setShowThemeSelector(!showThemeSelector)}>
            <Palette className="h-4 w-4" />
          </Button>
          
          {showThemeSelector && (
            <div className="absolute top-full right-0 mt-2 bg-white/10 backdrop-blur-md rounded-lg p-2 shadow-lg">
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key as PomodoroTheme)}
                  className={cn(
                    "block w-full text-left px-3 py-2 rounded-md text-sm transition-all",
                    theme.textColor,
                    currentTheme === key ? "bg-white/20" : "hover:bg-white/10"
                  )}>
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={cn("absolute top-4 left-4 z-10", isFullScreen ? "top-8 left-8" : "")}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-full backdrop-blur-sm transition-all",
            theme.buttonClass,
            theme.textColor
          )}
          onClick={toggleFullScreen}>
          {isFullScreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <div className="relative">
          <div className="w-64 h-64 rounded-full border-8 border-white/20 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                className={cn("transition-all duration-1000", theme.progressColor)}
                style={{ strokeLinecap: "round" }}
              />
            </svg>

            <div className="text-center">
              <div className={cn("text-5xl font-bold tracking-tight", theme.textColor)}>
                {formatTime(timeLeft)}
              </div>
              <div className={cn("text-sm opacity-80 mt-2", theme.textColor)}>
                {isRunning ? "专注中" : timeLeft === 0 ? "完成！" : "准备开始"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className={cn(
                "rounded-full px-8 py-6 text-lg font-medium shadow-lg transition-all hover:scale-105",
                theme.buttonClass,
                theme.textColor
              )}>
              <Play className="h-5 w-5 mr-2" />
              开始
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              className={cn(
                "rounded-full px-8 py-6 text-lg font-medium shadow-lg transition-all hover:scale-105",
                theme.buttonClass,
                theme.textColor
              )}>
              <Pause className="h-5 w-5 mr-2" />
              暂停
            </Button>
          )}

          <Button
            onClick={handleReset}
            variant="ghost"
            className={cn(
              "rounded-full p-6 text-lg font-medium",
              theme.textColor,
              "hover:bg-white/20"
            )}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}