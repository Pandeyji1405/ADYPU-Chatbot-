'use client';

import { useEffect } from 'react';
import { applyUiTheme, getStoredUiThemeId } from '@/lib/ui-theme.js';

export default function ThemeInit() {
  useEffect(() => {
    const stored = getStoredUiThemeId();
    if (stored) applyUiTheme(stored);
  }, []);

  return null;
}

