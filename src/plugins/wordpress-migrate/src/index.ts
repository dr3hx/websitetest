import type { Config, Plugin } from 'payload';
import { migrate } from './migrate';
import { WordPressConfig } from './types';
import React from 'react';

export const wordpressMigrate = (wpConfig: WordPressConfig): Plugin => {
  return async (incomingConfig: Config): Promise<Config> => {
    const config: Config = {
      ...incomingConfig,
      admin: {
        ...incomingConfig.admin,
        components: {
          ...incomingConfig.admin?.components,
          beforeDashboard: [
            ...(incomingConfig.admin?.components?.beforeDashboard || []),
            async () => {
              const { default: MigrationButton } = await import('./components/MigrationButton');
              return React.createElement(MigrationButton);
            },
          ],
        },
      },
      endpoints: [
        ...(incomingConfig.endpoints || []),
        {
          path: '/wordpress-migrate',
          method: 'post',
          handler: async (req: any, res: any) => {
            try {
              await migrate(wpConfig, req.payload);
              res.status(200).json({ message: 'Migration completed successfully' });
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              res.status(500).json({ error: errorMessage });
            }
          },
        },
      ],
    };

    return config;
  };
};
