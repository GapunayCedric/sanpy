import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
const allowedMime = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
];
const maxSize = config.upload.maxSizeMb * 1024 * 1024;
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, config.upload.dir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || path.extname(file.mimetype);
        cb(null, `${uuidv4()}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    if (allowedMime.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Allowed: PDF, JPEG, PNG, WebP'));
    }
};
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSize },
});
