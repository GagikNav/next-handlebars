import type { NextConfig } from 'next';
import './dev-hbs-watch';

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config, { dev, isServer }) {
    if (dev) {
      // Add .hbs loader
      config.module.rules.push({
        test: /\.hbs$/,
        use: 'raw-loader',
        type: 'javascript/auto',
      });
      config.resolve.extensions.push('.hbs');

      // Add .hbs files to webpack's watch list
      if (config.watchOptions) {
        config.watchOptions.ignored = [
          ...(Array.isArray(config.watchOptions.ignored) ? config.watchOptions.ignored : [config.watchOptions.ignored]).filter(Boolean),
          /node_modules/,
          '!**/*.hbs' // Don't ignore .hbs files
        ];
      } else {
        config.watchOptions = {
          ignored: [/node_modules/, '!**/*.hbs']
        };
      }
    }
    return config;
  },
};

export default nextConfig;
