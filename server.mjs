import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

// --- Configuration ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173; // Vite's default dev port, or from env
const base = process.env.BASE || '/';

// --- Vite Setup ---
let vite; // Vite dev server instance

async function createServer() {
  const app = express();

  if (!isProduction) {
    // Development mode: Use Vite's dev server middleware
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom', // Important for custom HTML handling
      base,
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static assets from dist/client
    // Compression middleware is recommended for production (e.g., express.static with compression)
    app.use((await import('compression')).default());
    app.use(
      base,
      (await import('serve-static')).default(path.resolve(__dirname, 'dist/client'), {
        index: false, // Do not serve index.html directly
      })
    );
  }

  // --- SSR Logic ---
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl.replace(base, ''); // Get URL relative to base

      let template;
      let render;
      let helmetContext = {}; // Initialize Helmet context for each request

      if (!isProduction) {
        // Development: Read template and load render function on each request
        template = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template); // Apply Vite HTML transforms (e.g., for HMR)
        
        // Load server entry using Vite's SSR load module
        const entry = await vite.ssrLoadModule('/src/entry-server.tsx');
        render = entry.render;
      } else {
        // Production: Read template once and import render function from server build
        template = await fs.readFile(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8');
        // The server entry build should be a .js file
        const serverEntry = await import('./dist/server/entry-server.js');
        render = serverEntry.render;
      }

      // Render the app
      const { html: appHtml, helmetContext: filledHelmetContext } = render(url, helmetContext);
      
      // Inject Helmet data into the template
      let html = template
        .replace(`<!--helmet-outlet-->`, `
          ${filledHelmetContext.helmet?.title?.toString() || ''}
          ${filledHelmetContext.helmet?.meta?.toString() || ''}
          ${filledHelmetContext.helmet?.link?.toString() || ''}
          ${filledHelmetContext.helmet?.style?.toString() || ''}
          ${filledHelmetContext.helmet?.script?.toString() || ''}
        `)
        .replace(`<!--ssr-outlet-->`, appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    } catch (e) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error('SSR Error:', e);
      res.status(500).end(e.stack || e.message);
    }
  });

  // --- Start Server ---
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();
