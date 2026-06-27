import { useState, useCallback, useRef } from 'react';
import { DailyData } from '@/types';

export function usePlayback(fullData: DailyData[] | null) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 5>(1); // days per tick
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalDays = fullData ? fullData.length : 0;

  // The data available to display up to the current playback day
  const visibleData = fullData ? fullData.slice(0, currentDayIndex + 1) : [];

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (!fullData || currentDayIndex >= totalDays - 1) return;
    
    setIsPlaying(true);
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Base speed: 1 second per tick. But we want it faster so let's do 250ms per tick
    intervalRef.current = setInterval(() => {
      setCurrentDayIndex((prev) => {
        const nextIndex = prev + speed;
        if (nextIndex >= totalDays - 1) {
          pause();
          return totalDays - 1;
        }
        return nextIndex;
      });
    }, 250);
  }, [fullData, currentDayIndex, totalDays, speed, pause]);

  const reset = useCallback(() => {
    pause();
    setCurrentDayIndex(0);
  }, [pause]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      if (currentDayIndex >= totalDays - 1) {
        // If at end, restart and play
        setCurrentDayIndex(0);
        // Small timeout to allow state to reset before playing
        setTimeout(play, 0);
      } else {
        play();
      }
    }
  }, [isPlaying, pause, play, currentDayIndex, totalDays]);

  const changeSpeed = useCallback((newSpeed: 1 | 2 | 5) => {
    setSpeed(newSpeed);
    if (isPlaying) {
      // restart interval with new speed
      pause();
      setTimeout(play, 0);
    }
  }, [isPlaying, pause, play]);

  const jumpToEnd = useCallback(() => {
    pause();
    setCurrentDayIndex(totalDays - 1);
  }, [pause, totalDays]);

  return {
    currentDayIndex,
    visibleData,
    isPlaying,
    speed,
    togglePlay,
    pause,
    reset,
    changeSpeed,
    jumpToEnd,
    totalDays
  };
}
