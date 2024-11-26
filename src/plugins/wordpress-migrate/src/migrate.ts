import WPAPI from 'wpapi';
import { Payload } from 'payload';
import { WordPressConfig } from './types';
import { convertToSlateAST } from './utils/convertToSlateAST';
import { downloadMedia } from './utils/downloadMedia';
import { extractTheme } from './design/extractTheme';
import { generateTheme } from './design/generateTheme';

export async function migrate(config: WordPressConfig, payload: Payload) {
  const wp = new WPAPI({
    endpoint: `${config.url}/wp-json`,
    username: config.username,
    password: config.password,
  });

  // Extract and generate theme if design migration is enabled
  if (config.design?.extractStyles || config.design?.extractColors || config.design?.extractTypography) {
    const theme = await extractTheme(config.url);
    const outputPath = config.design?.outputPath || './src/theme';
    generateTheme(theme, outputPath);

    // Save theme settings to Payload if themes collection exists
    if (config.collections?.themes) {
      await payload.create({
        collection: config.collections.themes,
        data: {
          name: 'WordPress Migrated Theme',
          settings: theme,
          active: true,
        },
      });
    }
  }

  // Migrate posts
  const posts = await wp.posts().get();
  for (const post of posts) {
    await payload.create({
      collection: config.collections?.posts || 'posts',
      data: {
        title: post.title.rendered,
        content: await convertToSlateAST(post.content.rendered),
        status: post.status === 'publish' ? 'published' : 'draft',
        publishedAt: post.date,
        slug: post.slug,
        featuredImage: post.featured_media ? 
          await downloadMedia(post.featured_media, wp, payload) : 
          undefined,
      },
    });
  }

  // Migrate pages
  const pages = await wp.pages().get();
  for (const page of pages) {
    await payload.create({
      collection: config.collections?.pages || 'pages',
      data: {
        title: page.title.rendered,
        content: await convertToSlateAST(page.content.rendered),
        status: page.status === 'publish' ? 'published' : 'draft',
        slug: page.slug,
      },
    });
  }

  // Migrate custom post types
  if (config.customPostTypes) {
    for (const [wpType, payloadCollection] of Object.entries(config.customPostTypes)) {
      const customPosts = await wp.posts().type(wpType).get();
      for (const post of customPosts) {
        await payload.create({
          collection: payloadCollection,
          data: {
            title: post.title.rendered,
            content: await convertToSlateAST(post.content.rendered),
            status: post.status === 'publish' ? 'published' : 'draft',
            slug: post.slug,
          },
        });
      }
    }
  }
}