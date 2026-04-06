'use client';

import { useEffect, useId, useState } from 'react';
import { DEFAULT_UI_THEME_ID, UI_THEMES, applyUiTheme, getStoredUiThemeId, setStoredUiThemeId } from '@/lib/ui-theme.js';

export default function ThemeSelect({ className, selectClassName, ariaLabel = 'UI theme' }) {
  const selectId = useId();
  const [value, setValue] = useState(DEFAULT_UI_THEME_ID);

  useEffect(() => {
    const stored = getStoredUiThemeId();
    setValue(stored || DEFAULT_UI_THEME_ID);
  }, []);

  function onChange(event) {
    const next = event.target.value;
    setValue(next);
    setStoredUiThemeId(next);
    applyUiTheme(next);
  }

  return (
    <div className={className}>
      <select id={selectId} className={selectClassName} value={value} onChange={onChange} aria-label={ariaLabel}>
        {UI_THEMES.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.label}
          </option>
        ))}
      </select>
    </div>
  );
}
