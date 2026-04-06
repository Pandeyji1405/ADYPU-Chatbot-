export const UI_THEME_STORAGE_KEY = 'adypu_ui_theme';

export const UI_THEMES = [
  {
    id: 'adypu',
    label: 'ADYPU Red',
    vars: {
      '--adypu-red-rgb': '239 68 68',
      '--adypu-red-dark-rgb': '185 28 28'
    }
  },
  {
    id: 'blue',
    label: 'Blue',
    vars: {
      '--adypu-red-rgb': '59 130 246',
      '--adypu-red-dark-rgb': '29 78 216'
    }
  },
  {
    id: 'sky',
    label: 'Sky',
    vars: {
      '--adypu-red-rgb': '14 165 233',
      '--adypu-red-dark-rgb': '3 105 161'
    }
  },
  {
    id: 'teal',
    label: 'Teal',
    vars: {
      '--adypu-red-rgb': '20 184 166',
      '--adypu-red-dark-rgb': '15 118 110'
    }
  },
  {
    id: 'indigo',
    label: 'Indigo',
    vars: {
      '--adypu-red-rgb': '99 102 241',
      '--adypu-red-dark-rgb': '67 56 202'
    }
  },
  {
    id: 'violet',
    label: 'Violet',
    vars: {
      '--adypu-red-rgb': '139 92 246',
      '--adypu-red-dark-rgb': '109 40 217'
    }
  },
  {
    id: 'fuchsia',
    label: 'Fuchsia',
    vars: {
      '--adypu-red-rgb': '217 70 239',
      '--adypu-red-dark-rgb': '162 28 175'
    }
  },
  {
    id: 'rose',
    label: 'Rose',
    vars: {
      '--adypu-red-rgb': '244 63 94',
      '--adypu-red-dark-rgb': '190 18 60'
    }
  },
  {
    id: 'emerald',
    label: 'Emerald',
    vars: {
      '--adypu-red-rgb': '16 185 129',
      '--adypu-red-dark-rgb': '4 120 87'
    }
  },
  {
    id: 'lime',
    label: 'Lime',
    vars: {
      '--adypu-red-rgb': '132 204 22',
      '--adypu-red-dark-rgb': '77 124 15'
    }
  },
  {
    id: 'amber',
    label: 'Amber',
    vars: {
      '--adypu-red-rgb': '245 158 11',
      '--adypu-red-dark-rgb': '180 83 9'
    }
  },
  {
    id: 'orange',
    label: 'Orange',
    vars: {
      '--adypu-red-rgb': '249 115 22',
      '--adypu-red-dark-rgb': '194 65 12'
    }
  },
  {
    id: 'slate',
    label: 'Slate',
    vars: {
      '--adypu-red-rgb': '148 163 184',
      '--adypu-red-dark-rgb': '71 85 105'
    }
  }
];

const DEFAULT_THEME_ID = 'adypu';

export function isValidUiThemeId(themeId) {
  return UI_THEMES.some((t) => t.id === themeId);
}

export function getStoredUiThemeId() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(UI_THEME_STORAGE_KEY);
    if (!raw) return null;
    return isValidUiThemeId(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function setStoredUiThemeId(themeId) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UI_THEME_STORAGE_KEY, themeId);
  } catch {
    // ignore write errors (private mode / blocked storage)
  }
}

export function applyUiTheme(themeId) {
  if (typeof document === 'undefined') return;

  const resolvedId = isValidUiThemeId(themeId) ? themeId : DEFAULT_THEME_ID;
  const theme = UI_THEMES.find((t) => t.id === resolvedId) || UI_THEMES[0];

  const root = document.documentElement;
  root.dataset.uiTheme = theme.id;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }

  return theme.id;
}
