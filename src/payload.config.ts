import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import {wordpressMigrate} from './plugins/wordpress-migrate/src/index'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

// Add Themes collection for WordPress design migration
const Themes = {
  slug: 'themes',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'colors',
          type: 'group',
          fields: [
            { name: 'primary', type: 'text' },
            { name: 'secondary', type: 'text' },
            { name: 'background', type: 'text' },
            { name: 'text', type: 'text' },
          ],
        },
        {
          name: 'typography',
          type: 'group',
          fields: [
            { name: 'fontFamily', type: 'text' },
            {
              name: 'fontSize',
              type: 'group',
              fields: [
                { name: 'base', type: 'text' },
                { name: 'h1', type: 'text' },
                { name: 'h2', type: 'text' },
                { name: 'h3', type: 'text' },
                { name: 'h4', type: 'text' },
                { name: 'body', type: 'text' },
              ],
            },
            {
              name: 'fontWeight',
              type: 'group',
              fields: [
                { name: 'normal', type: 'number' },
                { name: 'bold', type: 'number' },
              ],
            },
          ],
        },
        {
          name: 'spacing',
          type: 'group',
          fields: [
            { name: 'unit', type: 'number' },
            {
              name: 'scale',
              type: 'array',
              fields: [
                { name: 'value', type: 'number' },
              ],
            },
          ],
        },
        {
          name: 'breakpoints',
          type: 'group',
          fields: [
            { name: 'sm', type: 'text' },
            { name: 'md', type: 'text' },
            { name: 'lg', type: 'text' },
            { name: 'xl', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Themes, // Add Themes collection
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    wordpressMigrate({
      enabled: true,
      apiUrl: process.env.WORDPRESS_URL || 'http://localhost:8080',
      collections: {
        posts: 'posts',
        pages: 'pages',
        media: 'media',
        themes: 'themes',
      },
      design: {
        extractStyles: true,
        extractColors: true,
        extractTypography: true,
        outputPath: './src/theme',
      },
      credentials: {
        username: process.env.WORDPRESS_USERNAME,
        password: process.env.WORDPRESS_PASSWORD,
      },
    }),
    ...plugins,
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});