import express from 'express';
import {
  cadastrarUser,
  logar,
  logout,
  usuarioLogado,
  updateUser,
  getAllUsers,
  updateUserRole,
  criarProjeto,
  deletarProjeto,
  finalizeDaily,
  deleteUser,
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
router.post('/criar-projeto', verificarToken, criarProjeto);
router.delete('/deletar-projeto', verificarToken, deletarProjeto);
router.post('/finalizar-daily/:dailyId', verificarToken, finalizeDaily);
router.delete('/delete-account', verificarToken, deleteUser);

// Fetch projects for a user
router.get('/projetos', verificarToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.cargo;

    let selectProj;
    let queryArgs;

    // Debugging query to check projects in the database
    const checkProjectsQuery = 'SELECT * FROM projetos';
    const allProjectsResult = await conexao.execute(checkProjectsQuery);

    if (userRole === 'Admin') {
      // If user is an Admin, fetch all projects
      selectProj = 'SELECT * FROM projetos';
      queryArgs = [];
    } else {
      // For non-admin users, fetch only projects they're part of
      selectProj = `
        SELECT DISTINCT p.* 
        FROM projetos p
        LEFT JOIN projeto_usuarios pu ON p.id = pu.projectId
        WHERE p.criado_por = ? OR pu.userId = ?
      `;
      queryArgs = [userId, userId];
    }

    const result = await conexao.execute({
      sql: selectProj,
      args: queryArgs,
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Detailed error fetching projects:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: 'Erro ao buscar projetos',
      details: error.message,
    });
  }
});

// Fetch project details with members
router.get('/projects/id/:projectId', verificarToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // SQL query to fetch project details with members
    const query = `
      SELECT 
        p.id, 
        p.projectName, 
        p.projectDesc AS description, 
        p.deliveryDate AS endDate,
        (
          SELECT GROUP_CONCAT(u.nome, ', ')
          FROM projeto_usuarios pu 
          JOIN usuarios u ON pu.userId = u.id
          WHERE pu.projectId = p.id
        ) AS projectMembers
      FROM 
        projetos p
      WHERE 
        p.id = ?`;

    const result = await conexao.execute({
      sql: query,
      args: [projectId],
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

// Fetch user by name
router.get('/users/name/:name', verificarToken, async (req, res) => {
  const name = req.params.name;

  try {
    // Try exact match first
    let query = 'SELECT id, nome, imagem FROM usuarios WHERE nome = ?';
    let result = await conexao.execute({
      sql: query,
      args: [name],
    });

    // If no exact match, try case-insensitive match
    if (result.rows.length === 0) {
      query = 'SELECT id, nome, imagem FROM usuarios WHERE LOWER(nome) = LOWER(?)';
      result = await conexao.execute({
        sql: query,
        args: [name],
      });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Return the first matching user
    const user = result.rows[0];

    // Ensure image is in base64 format
    if (user.imagem) {
      // If not already a data URL, convert to data URL
      if (!user.imagem.startsWith('data:image')) {
        user.imagem = `data:image/jpeg;base64,${user.imagem}`;
      }
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Erro ao buscar usuário',
      details: error.message,
    });
  }
});

// Create a new sprint
router.post('/criar-sprint', verificarToken, async (req, res) => {
  try {
    const { projectId, name, deliveryDate } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO sprints 
      (projectId, name, deliveryDate, criado_por) 
      VALUES (?, ?, ?, ?)`;

    const result = await conexao.execute({
      sql: query,
      args: [projectId, name, deliveryDate, userId],
    });

    res.status(201).json({
      message: 'Sprint criada com sucesso',
      sprint: {
        id: Number(result.lastInsertRowid), // SQLite uses lastInsertRowid
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

// Create a new daily
router.post('/criar-daily', verificarToken, async (req, res) => {
  try {
    const { projectId, sprintId, name, description, deliveryDate, tag } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO dailys 
      (projectId, sprintId, name, description, deliveryDate, tag, criado_por) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

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

// Update daily tag
router.put('/atualizar-daily-tag', verificarToken, async (req, res) => {
  try {
    const { dailyId, newTag } = req.body;

    const query = `
      UPDATE dailys 
      SET tag = ? 
      WHERE id = ?`;

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

// Delete daily
router.delete('/deletar-daily/:dailyId', verificarToken, async (req, res) => {
  try {
    const { dailyId } = req.params;

    const query = `
      DELETE FROM dailys 
      WHERE id = ?`;

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

// Finalize sprint
router.post('/finalizar-sprint', verificarToken, async (req, res) => {
  const { projectId, sprintId, name, evaluationScores } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!projectId || !sprintId || !name || !evaluationScores) {
    return res.status(400).json({ error: 'Dados incompletos para finalizar sprint' });
  }

  const transaction = await conexao.transaction();

  try {
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

    // 3. Insert into finalized sprints
    const insertSprintQuery = `
      INSERT INTO sprintsfinalizadas 
      (projectId, name, atividades, equipe, comunicacao, entregas, finalizado_por) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const sprintFinalResult = await transaction.execute({
      sql: insertSprintQuery,
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

    const finalizedSprintId = Number(sprintFinalResult.lastInsertRowid);

    // 4. Fetch associated dailys
    const getDailysQuery = 'SELECT * FROM dailys WHERE sprintId = ? AND projectId = ?';
    const dailysResult = await transaction.execute({
      sql: getDailysQuery,
      args: [sprintId, projectId],
    });

    if (dailysResult.rows.length > 0) {
      // Prepare batch insert for dailys_finalizadas
      const insertDailysQuery = `
        INSERT INTO dailys_finalizadas 
        (projectId, sprintId, name, description, deliveryDate, tag, finalizado_por, data_finalizacao) 
        VALUES ${dailysResult.rows.map(() => '(?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)').join(', ')}`;

      const dailysArgs = dailysResult.rows.flatMap((daily) => [
        daily.projectId,
        finalizedSprintId, // Use the new finalized sprint ID
        daily.name,
        daily.description || '',
        daily.deliveryDate,
        daily.tag || 'Concluido',
        userId,
      ]);

      try {
        // Insert dailys into dailys_finalizadas
        const insertDailysResult = await transaction.execute({
          sql: insertDailysQuery,
          args: dailysArgs,
        });

        // Delete the original dailys
        const deleteDailysQuery = 'DELETE FROM dailys WHERE sprintId = ? AND projectId = ?';
        const deleteResult = await transaction.execute({
          sql: deleteDailysQuery,
          args: [sprintId, projectId],
        });
      } catch (insertError) {
        console.error('Error inserting dailys into dailys_finalizadas:', insertError);
        await transaction.rollback();
        return res.status(500).json({
          error: 'Erro ao mover dailys para finalizadas',
          details: insertError.message,
        });
      }
    }

    // 5. Delete the original sprint
    const deleteSprintQuery = 'DELETE FROM sprints WHERE id = ? AND projectId = ?';
    const deleteSprintResult = await transaction.execute({
      sql: deleteSprintQuery,
      args: [sprintId, projectId],
    });

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: 'Sprint finalizada com sucesso',
      sprintId: finalizedSprintId,
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

// Fetch sprints for a project
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

// Fetch dailies for a project
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

// Fetch ended sprints for a project
router.get('/project/:projectId/ended-sprints', verificarToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch the ended sprints
    const endedSprintsQuery = `
      SELECT 
        sf.id, 
        sf.name, 
        sf.atividades, 
        sf.equipe, 
        sf.comunicacao, 
        sf.entregas,
        sf.projectId
      FROM sprintsfinalizadas sf
      WHERE sf.projectId = ?`;

    const endedSprintsResult = await conexao.execute({
      sql: endedSprintsQuery,
      args: [projectId],
    });

    // For each ended sprint, fetch its dailies
    const endedSprints = await Promise.all(
      endedSprintsResult.rows.map(async (sprint) => {
        // Fetch dailys associated with the original sprint
        const dailiesQuery = `
          SELECT 
            id, 
            name, 
            description, 
            deliveryDate, 
            tag
          FROM dailys_finalizadas
          WHERE projectId = ? AND sprintId = ?`;

        const dailiesResult = await conexao.execute({
          sql: dailiesQuery,
          args: [projectId, sprint.id], // Use the id from sprintsfinalizadas
        });

        return {
          ...sprint,
          dailies: dailiesResult.rows,
          evaluationScores: {
            atividades: sprint.atividades,
            equipe: sprint.equipe,
            comunicacao: sprint.comunicacao,
            entregas: sprint.entregas,
          },
        };
      })
    );

    res.status(200).json(endedSprints);
  } catch (error) {
    console.error('Erro ao buscar sprints finalizadas:', error);
    res.status(500).json({ error: 'Erro ao buscar sprints finalizadas' });
  }
});

export default router;
