import { defineConfig } from 'astro/config';
import { execSync } from 'child_process';
import fs from 'fs';

// Fetch the latest Git commit hash
const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
         async transform(code, id) {
          if (!id.endsWith('vite-plugins-are-powerful.md')) {
            return;
          }
          // Get a random XKCD comic ID
          const latestRes = await fetch('https://xkcd.com/info.0.json');
          const { num } = await latestRes.json();
          const randomComicId = Math.floor(Math.random() * num) + 1;

          // Fetch the random XKCD comic
          const randomRes = await fetch(`https://xkcd.com/${randomComicId}/info.0.json`);
          let { img, alt, title } = await randomRes.json();
          alt = escapeHtml(alt);
          title = escapeHtml(title);
          const imageRes = await fetch(img);
          const buffer = await imageRes.arrayBuffer();

          // Download it locally
          fs.mkdirSync('public/xkcd', { recursive: true });
          fs.writeFileSync(`public/xkcd/${randomComicId}.png`, Buffer.from(buffer));

          // Craft HTML that references the local image
          const src = `/xkcd/${randomComicId}.png`;
          const tag = `<img src='${src}' alt='${alt}' title='${title}' style='max-width: 300px; height: auto; display: block; margin: auto;' />`;
          return code.replace('<!-- XKCD_RANDOM_COMIC -->', tag);
          return code;
        }
      },
    ],
  },
});
