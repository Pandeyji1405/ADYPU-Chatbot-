const SHORTFORM_ALIASES = [
  { pattern: /\bssd\b/gi, expansion: 'ssd student service division' },
  { pattern: /\bsod\b/gi, expansion: 'sod school of design' },
  { pattern: /\bvc\b/gi, expansion: 'vc vice chancellor' },
  { pattern: /\bspcr\b/gi, expansion: 'spcr students progression and corporate relations' }
];

export function expandDomainShortforms(query) {
  let expanded = String(query || '');
  for (const alias of SHORTFORM_ALIASES) {
    expanded = expanded.replace(alias.pattern, alias.expansion);
  }
  return expanded;
}
