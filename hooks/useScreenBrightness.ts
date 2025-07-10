import * as Brightness from 'expo-brightness';
import { useFocusEffect } from 'expo-router';
import { useRef } from 'react';

export function useScreenBrightness(targetBrightness: number) {
  const originalBrightness = useRef<number | null>(null);

  useFocusEffect(() => {
    let isActive = true;

    const changeBrightness = async () => {
      try {
        // Save original only once
        if (originalBrightness.current === null) {
          const current = await Brightness.getBrightnessAsync();
          if (isActive) originalBrightness.current = current;
        }

        await Brightness.setBrightnessAsync(targetBrightness);
      } catch (err) {
        console.warn('Brightness error:', err);
      }
    };

    const restoreBrightness = async () => {
      try {
        if (originalBrightness.current !== null) {
          await Brightness.setBrightnessAsync(originalBrightness.current);
          originalBrightness.current = null;
        }
      } catch (err) {
        console.warn('Restore error:', err);
      }
    };

    changeBrightness();

    return () => {
      isActive = false;
      restoreBrightness();
    };
  });
}