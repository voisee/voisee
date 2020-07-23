import { Router } from 'express';
import UserRouter from './Users';
import CategoryRouter from './Categories';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/categories', CategoryRouter);

// Export the base-router
export default router;
