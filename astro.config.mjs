import { defineConfig } from 'astro/config';
import { execSync } from 'child_process';
import fs from 'fs';

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
      /**
       * The below plugin is a PoC for the article about Vite plugins.
       * It is terrible practice to use HTML comments as macros.
       * Cool as hell though.
       */
      {
        name: 'vite-plugin-random-xkcd',
        async buildStart() {
          const latestRes = await fetch('https://xkcd.com/info.0.json');
          const { num } = await latestRes.json();
          const randomComicId = Math.floor(Math.random() * num) + 1;

          const randomRes = await fetch(`https://xkcd.com/${randomComicId}/info.0.json`);
          const { img } = await randomRes.json();
          const image = await fetch(img);
          const buffer = await image.arrayBuffer();

          fs.mkdirSync('public/xkcd', { recursive: true });
          fs.writeFileSync(`public/xkcd/random.png`, Buffer.from(buffer));
        }
      },
    ],
  },
});
