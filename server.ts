import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Public static files including download binaries
const publicDir = path.join(__dirname, 'public');
const downloadDir = path.join(publicDir, 'download');

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

app.use(express.static(publicDir));
app.use('/download', express.static(downloadDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const distExists = fs.existsSync(distPath);
  const isProduction = process.env.NODE_ENV === 'production' || (distExists && !fs.existsSync(path.join(__dirname, 'src')));

  if (!isProduction) {
    // Development mode with Vite middleware
    console.log('[Server] Geliştirme modunda başlatılıyor (Vite middleware)...');
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    console.log('[Server] Prodüksiyon modunda başlatılıyor (dist statik servis)...');
    if (!distExists) {
      console.error('[Server] HATA: dist klasörü bulunamadı! Lütfen önce "npm run build" çalıştırın.');
    }
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
