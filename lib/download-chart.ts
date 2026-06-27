"use client";

import { useCallback } from "react";
import * as htmlToImage from "html-to-image";

export function useDownloadChart() {
  const downloadChart = useCallback(async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const dataUrl = await htmlToImage.toPng(element, { backgroundColor: 'hsl(var(--background))' });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download chart', err);
    }
  }, []);

  return { downloadChart };
}
