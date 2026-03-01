import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', config.upload.dir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

app.use(
  cors({
    origin: config.nodeEnv === 'development' ? true : process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { message: 'Too many requests' },
  })
);

app.use(`${config.apiBase}/auth`, authRoutes);
app.use(`${config.apiBase}/business`, businessRoutes);
app.use(`${config.apiBase}/admin`, adminRoutes);

app.use(`/${config.upload.dir}`, express.static(path.join(__dirname, '..', config.upload.dir)));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`SA Tourism API running on port ${PORT} (${config.apiBase})`);
});
