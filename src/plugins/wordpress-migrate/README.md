# Payload CMS WordPress Migration Plugin

A one-click solution to migrate your WordPress site to Payload CMS, including content, design, and theme settings.

## Features

- Migrates posts, pages, and custom post types
- Preserves content formatting using Slate AST
- Transfers media files
- Maintains slugs and publication dates
- Extracts and migrates WordPress theme design:
  - Color schemes
  - Typography settings
  - Spacing and layout
  - Responsive breakpoints
- Supports both local and remote WordPress installations

## Installation

```bash
npm install payload-plugin-wordpress-migrate
```

## Usage

```typescript
import { buildConfig } from 'payload/config';
import { wordpressMigrate } from 'payload-plugin-wordpress-migrate';

export default buildConfig({
  plugins: [
    wordpressMigrate({
      url: 'https://your-wordpress-site.com',
      username: 'your-username', // Optional for public sites
      password: 'your-password', // Optional for public sites
      collections: {
        posts: 'posts', // Your Payload collection name for posts
        pages: 'pages', // Your Payload collection name for pages
        media: 'media', // Your Payload media collection name
        themes: 'themes', // Optional: collection for theme settings
      },
      customPostTypes: {
        'products': 'products', // Map WP custom post types to Payload collections
      },
      design: {
        extractStyles: true,
        extractColors: true,
        extractTypography: true,
        outputPath: './src/theme', // Where to save generated theme files
      },
    }),
  ],
  // ... rest of your Payload config
});
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| url | string | WordPress site URL |
| username | string? | WordPress username (optional) |
| password | string? | WordPress password (optional) |
| collections | object | Mapping of WordPress content types to Payload collections |
| customPostTypes | object | Mapping of WordPress custom post types to Payload collections |
| design | object | Configuration for design migration |
| design.extractStyles | boolean | Extract and migrate CSS styles |
| design.extractColors | boolean | Extract color scheme |
| design.extractTypography | boolean | Extract typography settings |
| design.outputPath | string | Output path for generated theme files |

## Generated Theme Files

The plugin generates two files in the specified output directory:

1. `theme.css`: Contains CSS variables and base styles
2. `theme.config.json`: Contains theme configuration for Payload

## License

MIT