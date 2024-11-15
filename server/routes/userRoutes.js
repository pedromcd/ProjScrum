import express from 'express';
import {
  cadastrarUser,
  logar,
  logout,
  usuarioLogado,
  updateUser,
  getAllUsers,
  updateUserRole,
  getProjetos,
  criarProjeto,
  deletarProjeto,
} from '../controllers/userController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';
import { conexao } from '../config/database.js';

const router = express.Router();

router.post('/cadastrar', cadastrarUser);
router.post('/login', logar);
router.get('/logout', logout);
router.get('/usuarioLogado', verificarToken, usuarioLogado);
router.put('/updateUser', verificarToken, updateUser);
router.get('/usuarios', verificarToken, getAllUsers);
router.put('/update-user-role', verificarToken, updateUserRole);
router.get('/projetos', verificarToken, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming your token payload uses 'id'
    const selectProj = `
      SELECT p.* 
      FROM projetos p
      JOIN projeto_usuarios pu ON p.id = pu.projectId
      WHERE pu.userId = ?`;

    const result = await conexao.execute({
      sql: selectProj,
      args: [userId],
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
});
router.post('/criar-projeto', verificarToken, criarProjeto);
router.delete('/deletar-projeto', verificarToken, deletarProjeto);
router.get('/projects/:projectName', verificarToken, async (req, res) => {
  try {
    const { projectName } = req.params;

    // SQL query to fetch project details with members
    const query = `
      SELECT 
        p.id, 
        p.projectName, 
        p.projectDesc as description, 
        p.deliveryDate as endDate,
        GROUP_CONCAT(u.nome) AS projectMembers
      FROM 
        projetos p
      LEFT JOIN 
        projeto_usuarios pu ON p.id = pu.projectId
      LEFT JOIN 
        usuarios u ON pu.userId = u.id
      WHERE 
        p.projectName = ?
      GROUP BY 
        p.id
    `;

    const result = await conexao.execute({
      sql: query,
      args: [projectName],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});
router.get('/users/name/:name', verificarToken, async (req, res) => {
  try {
    const { name } = req.params;

    const query = 'SELECT id, nome, email, imagem FROM usuarios WHERE nome = ?';
    const result = await conexao.execute({
      sql: query,
      args: [name],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user by name:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.post('/criar-sprint', verificarToken, async (req, res) => {
  try {
    const { projectId, name, deliveryDate } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO sprints 
      (projectId, name, deliveryDate, criado_por) 
      VALUES (?, ?, ?, ?)
    `;

    const result = await conexao.execute({
      sql: query,
      args: [projectId, name, deliveryDate, userId],
    });

    res.status(201).json({
      message: 'Sprint criada com sucesso',
      sprint: {
        id: Number(result.lastInsertRowid),
        projectId,
        name,
        deliveryDate,
      },
    });
  } catch (error) {
    console.error('Erro ao criar sprint:', error);
    res.status(500).json({ error: 'Erro ao criar sprint' });
  }
});
router.post('/criar-daily', verificarToken, async (req, res) => {
  try {
    const { projectId, sprintId, name, description, deliveryDate, tag } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO dailys 
      (projectId, sprintId, name, description, deliveryDate, tag, criado_por) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await conexao.execute({
      sql: query,
      args: [projectId, sprintId, name, description, deliveryDate, tag, userId],
    });

    res.status(201).json({
      message: 'Daily criada com sucesso',
      daily: {
        id: Number(result.lastInsertRowid),
        projectId,
        sprintId,
        name,
        description,
        deliveryDate,
        tag,
      },
    });
  } catch (error) {
    console.error('Erro ao criar daily:', error);
    res.status(500).json({ error: 'Erro ao criar daily' });
  }
});
router.put('/atualizar-daily-tag', verificarToken, async (req, res) => {
  try {
    const { dailyId, newTag } = req.body;

    const query = `
      UPDATE dailys 
      SET tag = ? 
      WHERE id = ?
    `;

    const result = await conexao.execute({
      sql: query,
      args: [newTag, dailyId],
    });

    res.status(200).json({
      message: 'Tag da daily atualizada com sucesso',
      rowsAffected: result.rowsAffected,
    });
  } catch (error) {
    console.error('Erro ao atualizar tag da daily:', error);
    res.status(500).json({ error: 'Erro ao atualizar tag da daily' });
  }
});
router.delete('/deletar-daily/:dailyId', verificarToken, async (req, res) => {
  try {
    const { dailyId } = req.params;

    const query = `
      DELETE FROM dailys 
      WHERE id = ?
    `;

    const result = await conexao.execute({
      sql: query,
      args: [dailyId],
    });

    res.status(200).json({
      message: 'Daily deletada com sucesso',
      rowsAffected: result.rowsAffected,
    });
  } catch (error) {
    console.error('Erro ao deletar daily:', error);
    res.status(500).json({ error: 'Erro ao deletar daily' });
  }
});
router.post('/finalizar-sprint', verificarToken, async (req, res) => {
  const { projectId, sprintId, name, evaluationScores } = req.body;
  const userId = req.user.id;

  console.log('Sprint Finalization Request:', {
    projectId,
    sprintId,
    name,
    evaluationScores,
    userId,
  });

  // Validate input
  if (!projectId || !sprintId || !name || !evaluationScores) {
    return res.status(400).json({ error: 'Dados incompletos para finalizar sprint' });
  }

  const transaction = await conexao.transaction();

  try {
    // Detailed logging and verification steps

    // 1. Verify project exists
    const checkProjectQuery = 'SELECT * FROM projetos WHERE id = ?';
    const projectCheckResult = await transaction.execute({
      sql: checkProjectQuery,
      args: [projectId],
    });

    if (projectCheckResult.rows.length === 0) {
      await transaction.rollback();
      console.error('Projeto não encontrado:', projectId);
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // 2. Verify sprint exists and belongs to the project
    const checkSprintQuery = 'SELECT * FROM sprints WHERE id = ? AND projectId = ?';
    const sprintCheckResult = await transaction.execute({
      sql: checkSprintQuery,
      args: [sprintId, projectId],
    });

    if (sprintCheckResult.rows.length === 0) {
      await transaction.rollback();
      console.error('Sprint não encontrada:', { sprintId, projectId });
      return res.status(404).json({ error: 'Sprint não encontrada no projeto' });
    }

    // 3. Insert into finalized sprints with explicit column names
    const insertQuery = `
      INSERT INTO sprintsfinalizadas 
      (projectId, name, atividades, equipe, comunicacao, entregas, finalizado_por) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await transaction.execute({
      sql: insertQuery,
      args: [
        projectId,
        name,
        evaluationScores.atividades,
        evaluationScores.equipe,
        evaluationScores.comunicacao,
        evaluationScores.entregas,
        userId,
      ],
    });

    // 4. Delete associated dailys
    const deleteDailysQuery = 'DELETE FROM dailys WHERE sprintId = ? AND projectId = ?';
    await transaction.execute({
      sql: deleteDailysQuery,
      args: [sprintId, projectId],
    });

    // 5. Delete the original sprint
    const deleteSprintQuery = 'DELETE FROM sprints WHERE id = ? AND projectId = ?';
    await transaction.execute({
      sql: deleteSprintQuery,
      args: [sprintId, projectId],
    });

    // Commit the transaction
    await transaction.commit();

    console.log('Sprint finalizada com sucesso:', {
      sprintId,
      projectId,
      insertedId: Number(result.lastInsertRowid),
    });

    res.status(201).json({
      message: 'Sprint finalizada com sucesso',
      sprintId: Number(result.lastInsertRowid),
    });
  } catch (error) {
    // Rollback the transaction in case of any error
    await transaction.rollback();

    console.error('Erro detalhado ao finalizar sprint:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    res.status(500).json({
      error: 'Erro ao finalizar sprint',
      details: error.message,
      fullError: error,
    });
  }
});
router.get('/project/:projectId/sprints', verificarToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const query = 'SELECT * FROM sprints WHERE projectId = ?';
    const result = await conexao.execute({
      sql: query,
      args: [projectId],
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar sprints:', error);
    res.status(500).json({ error: 'Erro ao buscar sprints' });
  }
});
router.get('/project/:projectId/dailies', verificarToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const query = 'SELECT * FROM dailys WHERE projectId = ?';
    const result = await conexao.execute({
      sql: query,
      args: [projectId],
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar dailies:', error);
    res.status(500).json({ error: 'Erro ao buscar dailies' });
  }
});

export default router; // Ensure you have a default export
