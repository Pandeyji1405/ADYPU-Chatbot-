'use client';

import { useEffect, useId, useState } from 'react';
import { UI_THEMES, applyUiTheme, getStoredUiThemeId, setStoredUiThemeId } from '@/lib/ui-theme.js';

export default function ThemeSelect({ className, selectClassName, ariaLabel = 'UI theme' }) {
  const selectId = useId();
  const [value, setValue] = useState('adypu');

  useEffect(() => {
    const stored = getStoredUiThemeId();
    if (stored) setValue(stored);
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

