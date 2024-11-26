import axios from 'axios';
import { parse } from 'node-html-parser';
import * as css from 'css';
import Color from 'color';
import { ThemeSettings } from '../types';

export async function extractTheme(url: string): Promise<ThemeSettings> {
  const response = await axios.get(url);
  const root = parse(response.data);
  
  // Extract all CSS links
  const cssLinks = root.querySelectorAll('link[rel="stylesheet"]')
    .map(link => link.getAttribute('href'))
    .filter(href => href && !href.includes('wp-admin'))
    .map(href => {
      if (href?.startsWith('http')) return href;
      return new URL(href, url).toString();
    });

  // Fetch and parse all CSS
  const cssContents = await Promise.all(
    cssLinks.map(async link => {
      try {
        const res = await axios.get(link);
        return res.data;
      } catch (error) {
        console.error(`Failed to fetch CSS from ${link}:`, error);
        return '';
      }
    })
  );

  const theme: ThemeSettings = {
    colors: {
      primary: '',
      secondary: '',
      background: '',
      text: '',
    },
    typography: {
      fontFamily: '',
      fontSize: {
        base: '16px',
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        h4: '1.5rem',
        body: '1rem',
      },
      fontWeight: {
        normal: 400,
        bold: 700,
      },
    },
    spacing: {
      unit: 8,
      scale: [0, 0.25, 0.5, 1, 1.5, 2, 3, 4, 5],
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  };

  // Extract inline styles
  const inlineStyles = root.querySelectorAll('style')
    .map(style => style.textContent)
    .join('\n');

  // Combine inline styles with external CSS
  const allCss = [...cssContents, inlineStyles].filter(Boolean);

  // Parse CSS and extract theme values
  allCss.forEach(cssContent => {
    try {
      const parsedCss = css.parse(cssContent);
      extractColors(parsedCss, theme);
      extractTypography(parsedCss, theme);
      extractBreakpoints(parsedCss, theme);
    } catch (error) {
      console.error('Failed to parse CSS:', error);
    }
  });

  // Extract computed styles from body
  const bodyStyles = root.querySelector('body');
  if (bodyStyles) {
    const style = bodyStyles.getAttribute('style');
    if (style) {
      theme.colors.background = extractStyleValue(style, 'background-color') || theme.colors.background;
      theme.colors.text = extractStyleValue(style, 'color') || theme.colors.text;
    }
  }

  return theme;
}

function extractStyleValue(style: string, property: string): string | null {
  const regex = new RegExp(`${property}:\\s*([^;]+)`);
  const match = style.match(regex);
  return match ? match[1].trim() : null;
}

function extractColors(parsedCss: any, theme: ThemeSettings) {
  const colorProperties = new Map();

  css.walk(parsedCss, {
    visit: 'declaration',
    enter: (node: any) => {
      if (node.property && (
        node.property.includes('color') ||
        node.property.includes('background') ||
        node.property.includes('border')
      )) {
        try {
          const color = Color(node.value);
          if (color.alpha() > 0) {
            colorProperties.set(node.value, (colorProperties.get(node.value) || 0) + 1);
          }
        } catch (e) {}
      }
    },
  });

  // Sort colors by frequency and assign to theme
  const sortedColors = Array.from(colorProperties.entries())
    .sort((a, b) => b[1] - a[1]);

  if (sortedColors.length > 0) {
    theme.colors.primary = sortedColors[0][0];
    if (sortedColors.length > 1) {
      theme.colors.secondary = sortedColors[1][0];
    }
  }
}

function extractTypography(parsedCss: any, theme: ThemeSettings) {
  const fontFamilies = new Map();
  
  css.walk(parsedCss, {
    visit: 'declaration',
    enter: (node: any) => {
      if (node.property === 'font-family') {
        const cleanValue = node.value.replace(/['"]/g, '').split(',')[0].trim();
        fontFamilies.set(cleanValue, (fontFamilies.get(cleanValue) || 0) + 1);
      }
      if (node.property === 'font-size' && node.parent?.selectors) {
        const selector = node.parent.selectors[0];
        updateFontSize(selector, node.value, theme);
      }
    },
  });

  // Set most common font family as default
  const sortedFonts = Array.from(fontFamilies.entries())
    .sort((a, b) => b[1] - a[1]);
  
  if (sortedFonts.length > 0) {
    theme.typography.fontFamily = sortedFonts[0][0];
  }
}

function extractBreakpoints(parsedCss: any, theme: ThemeSettings) {
  css.walk(parsedCss, {
    visit: 'media',
    enter: (node: any) => {
      const query = node.media;
      const match = query.match(/min-width:\s*(\d+)px/);
      if (match) {
        const width = parseInt(match[1]);
        if (width <= 640) theme.breakpoints.sm = `${width}px`;
        else if (width <= 768) theme.breakpoints.md = `${width}px`;
        else if (width <= 1024) theme.breakpoints.lg = `${width}px`;
        else theme.breakpoints.xl = `${width}px`;
      }
    },
  });
}

function updateFontSize(selector: string, value: string, theme: ThemeSettings) {
  if (selector === 'body') theme.typography.fontSize.base = value;
  else if (selector.includes('h1')) theme.typography.fontSize.h1 = value;
  else if (selector.includes('h2')) theme.typography.fontSize.h2 = value;
  else if (selector.includes('h3')) theme.typography.fontSize.h3 = value;
  else if (selector.includes('h4')) theme.typography.fontSize.h4 = value;
}