import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext'; // Path verified
import React from 'react'; // Added React import for StrictMode

export interface RenderResult {
  html: string;
  helmetContext: Record<string, any>;
}

export function render(url: string, helmetContext: Record<string, any>): RenderResult {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <LanguageProvider>
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </LanguageProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
  return { html, helmetContext };
}
