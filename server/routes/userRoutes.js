import express from 'express';
import { cadastrarUser, logar, logout, usuarioLogado, updateUser } from '../controllers/userController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/cadastrar', cadastrarUser);
router.post('/login', logar);
router.get('/logout', logout);
router.get('/usuarioLogado', verificarToken, usuarioLogado); // Middleware added
router.put('/updateUser', verificarToken, updateUser);

export default router; // Ensure you have a default export
