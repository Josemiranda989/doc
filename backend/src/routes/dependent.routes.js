import { Router } from 'express';
import dependentController from '../controllers/dependent.controller.js';

const router = Router();

router.get('/', dependentController.getAll);
router.get('/:id', dependentController.getById);
router.post('/', dependentController.create);
router.patch('/:id', dependentController.update);
router.delete('/:id', dependentController.remove);

export default router;
