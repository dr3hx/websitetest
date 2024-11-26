export interface WordPressConfig {
  url: string;
  username?: string;
  password?: string;
  apiKey?: string;
  collections?: {
    posts?: string;
    pages?: string;
    media?: string;
    themes?: string;
  };
  customPostTypes?: {
    [key: string]: string;
  };
  design?: {
    extractStyles?: boolean;
    extractLayouts?: boolean;
    extractColors?: boolean;
    extractTypography?: boolean;
    outputPath?: string;
  };
}

export interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    [key: string]: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      body: string;
    };
    fontWeight: {
      normal: number;
      bold: number;
    };
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  breakpoints: {
    [key: string]: string;
  };
}