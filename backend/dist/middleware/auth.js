import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }
        next();
    };
}
