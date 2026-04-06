'use client';

import { useEffect } from 'react';
import { DEFAULT_UI_THEME_ID, applyUiTheme, getStoredUiThemeId } from '@/lib/ui-theme.js';

export default function ThemeInit() {
  useEffect(() => {
    const stored = getStoredUiThemeId();
    applyUiTheme(stored || DEFAULT_UI_THEME_ID);
  }, []);

  return null;
}
