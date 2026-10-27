import { Router } from 'express';
import medicationController from '../controllers/medication.controller.js';

const router = Router();

router.get('/', medicationController.getAll);
router.get('/:id', medicationController.getById);
router.post('/', medicationController.create);
router.patch('/:id', medicationController.update);
router.delete('/:id', medicationController.remove);

export default router;
