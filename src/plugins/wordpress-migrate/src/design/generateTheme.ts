import { ThemeSettings } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export function generateTheme(theme: ThemeSettings, outputPath: string) {
  // Generate CSS variables
  const cssVariables = `
:root {
  /* Colors */
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-background: ${theme.colors.background};
  --color-text: ${theme.colors.text};

  /* Typography */
  --font-family: ${theme.typography.fontFamily};
  --font-size-base: ${theme.typography.fontSize.base};
  --font-size-h1: ${theme.typography.fontSize.h1};
  --font-size-h2: ${theme.typography.fontSize.h2};
  --font-size-h3: ${theme.typography.fontSize.h3};
  --font-size-h4: ${theme.typography.fontSize.h4};
  --font-size-body: ${theme.typography.fontSize.body};
  
  /* Spacing */
  --spacing-unit: ${theme.spacing.unit}px;
  ${theme.spacing.scale.map((scale, i) => 
    `--spacing-${i}: calc(var(--spacing-unit) * ${scale});`
  ).join('\n  ')}
}

/* Base styles */
body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background-color: var(--color-background);
}

h1 { font-size: var(--font-size-h1); }
h2 { font-size: var(--font-size-h2); }
h3 { font-size: var(--font-size-h3); }
h4 { font-size: var(--font-size-h4); }

/* Responsive breakpoints */
${Object.entries(theme.breakpoints).map(([key, value]) => `
@media (min-width: ${value}) {
  .${key}\\: {
    display: block;
  }
}`).join('\n')}
`;

  // Generate theme configuration for Payload
  const themeConfig = {
    theme: {
      colors: theme.colors,
      typography: theme.typography,
      spacing: theme.spacing,
      breakpoints: theme.breakpoints,
    },
  };

  // Save files
  fs.mkdirSync(outputPath, { recursive: true });
  fs.writeFileSync(path.join(outputPath, 'theme.css'), cssVariables);
  fs.writeFileSync(
    path.join(outputPath, 'theme.config.json'), 
    JSON.stringify(themeConfig, null, 2)
  );
}