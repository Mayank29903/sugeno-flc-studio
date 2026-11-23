import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { runSugenoPipeline, generateHandCalculation } from '../engine/sugeno';

export const TOTAL_STEPS = 5; // 0..4

export function useFuzzyController(initialPreset) {
  const [preset, setPreset] = useState(initialPreset);
  const [inputs, setInputs] = useState(
    initialPreset.inputs.map(inp => inp.defaultValue)
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2000);
  const intervalRef = useRef(null);

  // Run the full pipeline
  const pipeline = useMemo(
    () => runSugenoPipeline(preset, inputs),
    [preset, inputs]
  );

  // Generate hand calc
  const handCalc = useMemo(
    () => generateHandCalculation(preset, inputs, pipeline),
    [preset, inputs, pipeline]
  );

  // When preset changes, reset inputs & step
  const changePreset = useCallback((newPreset) => {
    setPreset(newPreset);
    setInputs(newPreset.inputs.map(inp => inp.defaultValue));
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  // Update a single input value
  const setInput = useCallback((index, value) => {
    setInputs(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  // Playback controls
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  const stepForward = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const stepBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const goToStep = useCallback((s) => {
    setCurrentStep(Math.max(0, Math.min(s, TOTAL_STEPS - 1)));
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(s => {
          if (s >= TOTAL_STEPS - 1) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed]);

  return {
    preset,
    changePreset,
    inputs,
    setInput,
    currentStep,
    goToStep,
    isPlaying,
    speed,
    setSpeed,
    pipeline,
    handCalc,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
  };
}
