import express from 'express';
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { BLOG_POSTS } from './src/blogData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const DIST_DIR = path.resolve(__dirname, 'dist');

// Define core pages and dynamically import blog posts
const getRoutes = (): string[] => {
  const coreRoutes = [
    '/',
    '/unscrambler',
    '/anagram-solver',
    '/words-az',
    '/strategy',
    '/blog',
    '/dictionary',
    '/about',
    '/contact',
    '/policy',
    '/terms'
  ];

  const blogRoutes = BLOG_POSTS.map(post => `/blog/${post.id}`);

  return [...coreRoutes, ...blogRoutes];
};

async function main() {
  console.log('🚀 Starting build-time prerendering...');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: dist/ directory not found. Please build the Vite app first using "npm run build".');
    process.exit(1);
  }

  // 1. Start a local server to serve the static built files
  const app = express();
  app.use(express.static(DIST_DIR));
  
  // SPA fallback: any deep route that isn't a physical file falls back to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });

  const server = app.listen(PORT, '127.0.0.1', async () => {
    console.log(`📡 Local static server running on http://127.0.0.1:${PORT}`);

    try {
      // 2. Launch headless browser
      console.log('🤖 Launching headless Chromium browser...');
      const browser = await chromium.launch({
        headless: true
      });
      const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
      });

      const routes = getRoutes();
      console.log(`📋 Found ${routes.length} routes to prerender.`);

      // 3. Crawl each route
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        const pageUrl = `http://127.0.0.1:${PORT}${route}`;
        console.log(`[${i + 1}/${routes.length}] Rendering: ${route}`);

        const page = await context.newPage();
        
        // Go to page and wait until network is idle to guarantee React hydration/rendering is complete
        await page.goto(pageUrl, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Extract fully-rendered DOM HTML
        let html = await page.content();

        // Backup safety layer: ensure words-az and dictionary routes explicitly have the noindex tag
        if (route === '/words-az' || route === '/dictionary') {
          if (!html.includes('name="robots"') && !html.includes("name='robots'")) {
            html = html.replace('<head>', '<head>\n    <meta name="robots" content="noindex, follow">');
          }
        }

        // Target output file path
        let targetFilePath: string;
        if (route === '/') {
          targetFilePath = path.join(DIST_DIR, 'index.html');
        } else {
          // e.g. /about -> dist/about/index.html
          const targetDir = path.join(DIST_DIR, route);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          targetFilePath = path.join(targetDir, 'index.html');
        }

        // Save HTML file
        fs.writeFileSync(targetFilePath, html, 'utf8');
        console.log(`   ✓ Saved: ${targetFilePath}`);
        
        await page.close();
      }

      // 3.5. Generate sitemap.xml dynamically
      console.log('🗺️ Generating sitemap.xml dynamically...');
      const baseUrl = 'https://unscramblerhub.com';
      let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      for (const route of routes) {
        let priority = '0.6';
        if (route === '/') {
          priority = '1.0';
        } else if (route === '/unscrambler' || route === '/anagram-solver') {
          priority = '0.95';
        } else if (route === '/words-az') {
          priority = '0.9';
        } else if (route === '/strategy' || route === '/blog' || route === '/dictionary') {
          priority = '0.8';
        } else if (route === '/about' || route === '/contact') {
          priority = '0.5';
        } else if (route === '/policy' || route === '/terms') {
          priority = '0.3';
        }

        const urlPath = route === '/' ? '' : route;
        sitemapXml += `  <url><loc>${baseUrl}${urlPath}</loc><priority>${priority}</priority></url>\n`;
      }
      sitemapXml += `</urlset>\n`;

      // Save to dist/sitemap.xml
      const distSitemapPath = path.join(DIST_DIR, 'sitemap.xml');
      fs.writeFileSync(distSitemapPath, sitemapXml, 'utf8');
      console.log(`   ✓ Saved dynamic sitemap to dist: ${distSitemapPath}`);

      // Save to public/sitemap.xml to keep source folder in sync
      const publicSitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
      try {
        fs.writeFileSync(publicSitemapPath, sitemapXml, 'utf8');
        console.log(`   ✓ Saved dynamic sitemap to public: ${publicSitemapPath}`);
      } catch (err) {
        console.warn('⚠️ Could not write to public/sitemap.xml, skipping source sync:', err);
      }

      // 4. Cleanup
      console.log('🧹 Prerendering complete. Cleaning up...');
      await browser.close();
      server.close(() => {
        console.log('🛑 Local server stopped successfully.');
        console.log('✨ Build-time prerendering completed successfully!');
        process.exit(0);
      });

    } catch (err) {
      console.error('❌ Prerendering failed with error:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

main().catch(err => {
  console.error('❌ Unhandled top-level error:', err);
  process.exit(1);
});
