import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: parseInt(process.env.PORT ?? '5000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    apiBase: process.env.API_BASE ?? '/api/v1',
    db: {
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '3306', 10),
        user: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME ?? 'sanpy_tourism',
    },
    jwt: {
        secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
    upload: {
        dir: process.env.UPLOAD_DIR ?? 'uploads',
        maxSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '5', 10),
        allowedPdf: process.env.ALLOWED_MIME_PDF ?? 'application/pdf',
        allowedImage: (process.env.ALLOWED_MIME_IMAGE ?? 'image/jpeg,image/png,image/webp').split(','),
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
    },
};
