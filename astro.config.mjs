import { defineConfig } from 'astro/config';
import { execSync } from 'child_process';

// Fetch the latest Git commit hash
const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
  site: 'https://dacrosbycode.com',
  vite: {
    plugins: [
      {
        name: 'vite-plugin-revision',
        config: () => ({
          define: {
            'import.meta.env.REVISION': JSON.stringify(commitHash),
          },
        }),
      },
    ],
  },
});
