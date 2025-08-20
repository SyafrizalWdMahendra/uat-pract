import { Router } from 'express';
import { getItems, createItem, updateItem, deleteItem } from '../controllers/ItemController';

const router = Router();

router.get('/', getItems);
router.post('/', createItem);
router.put('/:id', updateItem); 
router.delete('/:id', deleteItem);


export default router;
