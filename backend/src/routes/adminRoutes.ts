import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { getPendingRegistrations, getRegistrationById, approveRegistration, rejectRegistration } from '../controllers/adminController.js';
import { adminDashboard } from '../controllers/analyticsController.js';
import { getReportData, getReportFiltersMeta } from '../controllers/reportsController.js';
import { sendMessage, getBusinessListForAdmin } from '../controllers/messagesController.js';
import { approveRejectSchema } from '../validations/auth.js';
import { sendMessageSchema } from '../validations/message.js';
import { reportFilterSchema } from '../validations/report.js';
import { validateQuery } from '../middleware/validate.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/dashboard', adminDashboard);
router.get('/registrations', getPendingRegistrations);
router.get('/registrations/:id', getRegistrationById);
router.post('/registrations/:id/approve', validateBody(approveRejectSchema), approveRegistration);
router.post('/registrations/:id/reject', validateBody(approveRejectSchema), rejectRegistration);
router.get('/reports/filters', getReportFiltersMeta);
router.get('/reports', validateQuery(reportFilterSchema), getReportData);
router.get('/businesses', getBusinessListForAdmin);
router.post('/messages', validateBody(sendMessageSchema), sendMessage);

export default router;
