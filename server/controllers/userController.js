import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { conexao } from '../config/database.js';
import { generateToken, setCookieToken } from '../utils/tokenUtils.js';

// user
export const cadastrarUser = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM usuarios WHERE email = ?';
    const existingUsers = await conexao.execute({
      sql: checkUserQuery,
      args: [email],
    });

    if (existingUsers.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já cadastrado' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Insert new user
    const insertUserQuery = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    await conexao.execute({
      sql: insertUserQuery,
      args: [nome, email, hashedPassword],
    });

    res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
};

export const logar = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const findUserQuery = 'SELECT * FROM usuarios WHERE email = ?';
    const userResult = await conexao.execute({
      sql: findUserQuery,
      args: [email],
    });

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = generateToken(user);

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };

    res.cookie('auth_token', token, cookieOptions);

    res.status(200).json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no login' });
  }
};

export const logout = (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
    });

    res.status(200).json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro no logout' });
  }
};

export const usuarioLogado = async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const sqlUserData = 'SELECT id, nome, email, imagem, cargo FROM usuarios WHERE email = ?';
    const userResult = await conexao.execute({
      sql: sqlUserData,
      args: [decoded.email],
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.status(200).json(userResult.rows[0]);
  } catch (err) {
    console.error('Erro ao verificar token:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.user;
  const { nome, senha, imagem, email } = req.body;

  try {
    let hashedPassword;
    if (senha) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(senha, saltRounds);
    }

    let query = 'UPDATE usuarios SET nome = ?, email = ?';
    let params = [nome, email];

    if (senha) {
      query += ', senha = ?';
      params.push(hashedPassword);
    }

    // Explicitly handle image removal or update
    if (imagem !== undefined) {
      query += ', imagem = ?';
      params.push(imagem || null); // Use null to clear the image
    }

    query += ' WHERE id = ?';
    params.push(id);

    const result = await conexao.execute({
      sql: query,
      args: params,
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const getUserQuery = 'SELECT id, nome, email, imagem FROM usuarios WHERE id = ?';
    const userResult = await conexao.execute({
      sql: getUserQuery,
      args: [id],
    });

    res.status(200).json({
      message: 'Usuário atualizado com sucesso',
      user: userResult.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const query = 'SELECT id, nome, email FROM usuarios';
    const result = await conexao.execute(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;

  try {
    // Validate input with more specific checks
    if (!userId) {
      console.error('User ID is missing');
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    if (!role) {
      console.error('Role is missing');
      return res.status(400).json({ error: 'Cargo é obrigatório' });
    }

    // Validate role against allowed values (case-sensitive)
    const allowedRoles = ['Usuário', 'Gerente', 'Admin'];
    if (!allowedRoles.includes(role)) {
      console.error('Invalid role provided:', role);
      return res.status(400).json({
        error: 'Cargo inválido',
        allowedRoles: allowedRoles,
      });
    }

    // Check if user exists
    const checkUserQuery = 'SELECT * FROM usuarios WHERE id = ?';
    const userResult = await conexao.execute({
      sql: checkUserQuery,
      args: [userId],
    });

    if (userResult.rows.length === 0) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Get the current role before updating
    const currentRole = userResult.rows[0].cargo;

    // Update user role
    const updateQuery = 'UPDATE usuarios SET cargo = ? WHERE id = ?';
    const updateResult = await conexao.execute({
      sql: updateQuery,
      args: [role, userId],
    });

    // Verify the update
    const verifyQuery = 'SELECT cargo FROM usuarios WHERE id = ?';
    const verifyResult = await conexao.execute({
      sql: verifyQuery,
      args: [userId],
    });

    // Check if the role was actually updated
    if (verifyResult.rows[0]?.cargo !== role) {
      console.error('Role update failed', {
        expectedRole: role,
        actualRole: verifyResult.rows[0]?.cargo,
      });
      return res.status(500).json({ error: 'Falha ao atualizar o cargo' });
    }

    res.status(200).json({
      message: 'Cargo atualizado com sucesso',
      previousRole: currentRole,
      newRole: role,
    });
  } catch (error) {
    console.error('Erro detalhado ao atualizar cargo do usuário:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message,
    });
  }
};

// projetos
export const getProjetos = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.cargo; // Assuming you're passing user role in the token

    let selectProj;
    let queryArgs;

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
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
};

export const criarProjeto = async (req, res) => {
  const { projectName, projectDesc, deliveryDate, projectMembers } = req.body;
  const userId = req.user.id; // Assuming your token payload uses 'id'

  // Validate input
  if (!projectName) {
    return res.status(400).json({ error: 'Nome do projeto é obrigatório' });
  }

  if (!deliveryDate) {
    return res.status(400).json({ error: 'Data de entrega é obrigatória' });
  }

  const transaction = await conexao.transaction();

  try {
    // Insert project
    const insertProjQuery = `
      INSERT INTO projetos 
      (projectName, projectDesc, deliveryDate, criado_por) 
      VALUES (?, ?, ?, ?)
    `;

    let projectResult;
    try {
      projectResult = await transaction.execute({
        sql: insertProjQuery,
        args: [projectName, projectDesc || '', deliveryDate, userId],
      });
    } catch (insertError) {
      await transaction.rollback();
      console.error('Error inserting project:', insertError);
      return res.status(500).json({
        error: 'Erro ao criar projeto',
        details: insertError.message,
      });
    }

    // Convert BigInt to Number safely
    const projectId = Number(projectResult.lastInsertRowid);

    // Ensure the project creator is in the project members
    const uniqueMembers = Array.from(new Set([...projectMembers, userId]));

    // Add project members
    if (uniqueMembers && uniqueMembers.length > 0) {
      const membersQuery = `
        INSERT INTO projeto_usuarios (projectId, userId) 
        VALUES ${uniqueMembers.map(() => '(?, ?)').join(', ')}
      `;

      // Flatten the array for args
      const membersArgs = uniqueMembers.flatMap((memberId) => [projectId, memberId]);

      try {
        await transaction.execute({
          sql: membersQuery,
          args: membersArgs,
        });
      } catch (membersError) {
        await transaction.rollback();
        console.error('Error adding project members:', membersError);
        return res.status(500).json({
          error: 'Erro ao adicionar membros ao projeto',
          details: membersError.message,
        });
      }
    }

    // Commit the transaction
    await transaction.commit();

    // Custom JSON serializer to handle BigInt
    const safeStringify = (obj) => {
      return JSON.parse(
        JSON.stringify(obj, (key, value) => (typeof value === 'bigint' ? value.toString() : value))
      );
    };

    // Fetch the created project to return full details
    const getProjectQuery = `
      SELECT p.*, 
             GROUP_CONCAT(pu.userId) AS memberIds 
      FROM projetos p
      LEFT JOIN projeto_usuarios pu ON p.id = pu.projectId
      WHERE p.id = ?
      GROUP BY p.id
    `;

    let projectDetails;
    try {
      const projectDetailsResult = await conexao.execute({
        sql: getProjectQuery,
        args: [projectId],
      });
      projectDetails = projectDetailsResult.rows[0];
    } catch (fetchError) {
      console.error('Error fetching project details:', fetchError);
      // Not a critical error, so we'll still return the project creation success
    }

    // Safe response with converted project ID
    const responseData = {
      message: 'Projeto criado com sucesso',
      project: {
        id: projectId,
        projectName,
        projectDesc: projectDesc || '',
        deliveryDate,
        criado_por: userId,
        memberIds: projectDetails?.memberIds?.split(',') || [],
      },
    };

    // Use the custom stringify method
    const safeResponseData = safeStringify(responseData);

    res.status(201).json(safeResponseData);
  } catch (error) {
    // Rollback transaction on unexpected errors
    await transaction.rollback();
    console.error('Unexpected error during project creation:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message,
    });
  }
};

export const deletarProjeto = async (req, res) => {
  const { projectId } = req.body;

  // Validate input
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  // Ensure projectId is a number
  const parsedProjectId = parseInt(projectId, 10);
  if (isNaN(parsedProjectId)) {
    return res.status(400).json({ error: 'Invalid Project ID' });
  }

  // Ensure user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const userId = req.user.id;
  const transaction = await conexao.transaction();

  try {
    // Fetch detailed project and user information
    const projectQuery = `
      SELECT 
        p.id, 
        p.projectName, 
        p.criado_por, 
        u.nome AS owner_name,
        u.cargo AS owner_role,
        cu.nome AS current_user_name,
        cu.cargo AS current_user_role
      FROM projetos p
      JOIN usuarios u ON p.criado_por = u.id
      JOIN usuarios cu ON cu.id = ?
      WHERE p.id = ?
    `;

    const projectResult = await transaction.execute({
      sql: projectQuery,
      args: [userId, parsedProjectId],
    });

    // No project found
    if (projectResult.rows.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Projeto não encontrado',
        details: 'O projeto que você está tentando excluir não existe.',
      });
    }

    const project = projectResult.rows[0];

    // Check project ownership or admin privileges
    const isProjectOwner = project.criado_por === userId;
    const isAdmin = project.current_user_role === 'Admin';
    const isManagerOrAdmin = ['Admin', 'Gerente'].includes(project.current_user_role);

    if (!isProjectOwner && !isManagerOrAdmin) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Você não tem permissão para excluir este projeto',
        details: {
          isProjectOwner,
          isAdmin,
          isManagerOrAdmin,
          projectOwnerId: project.criado_por,
          currentUserId: userId,
          projectOwnerName: project.owner_name,
          currentUserName: project.current_user_name,
        },
      });
    }

    // Delete dependent records in a specific order
    // 1. Delete dailys first (due to foreign key constraints)
    await transaction.execute({
      sql: 'DELETE FROM dailys WHERE projectId = ?',
      args: [parsedProjectId],
    });

    // 2. Delete sprints
    await transaction.execute({
      sql: 'DELETE FROM sprints WHERE projectId = ?',
      args: [parsedProjectId],
    });

    // 3. Delete project-user associations
    await transaction.execute({
      sql: 'DELETE FROM projeto_usuarios WHERE projectId = ?',
      args: [parsedProjectId],
    });

    // 4. Delete finalized sprints
    await transaction.execute({
      sql: 'DELETE FROM sprintsfinalizadas WHERE projectId = ?',
      args: [parsedProjectId],
    });

    // 5. Finally, delete the project itself
    const deleteProjectQuery = 'DELETE FROM projetos WHERE id = ?';
    const deleteResult = await transaction.execute({
      sql: deleteProjectQuery,
      args: [parsedProjectId],
    });

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      message: 'Projeto excluído com sucesso',
      deletedProjectId: parsedProjectId,
    });
  } catch (error) {
    // Rollback the transaction in case of any error
    await transaction.rollback();

    console.error('Erro ao deletar projeto:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message,
    });
  }
};

export const finalizeDaily = async (req, res) => {
  const { dailyId } = req.params;
  const userId = req.user.id; // Assuming the user ID is available from the token

  const transaction = await conexao.transaction(); // Start a transaction

  try {
    // Step 1: Retrieve the daily to be finalized
    const getDailyQuery = 'SELECT * FROM dailys WHERE id = ?';
    const dailyResult = await transaction.execute({
      sql: getDailyQuery,
      args: [dailyId],
    });

    if (dailyResult.rows.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Daily não encontrada' });
    }

    const daily = dailyResult.rows[0];

    // Step 2: Insert into dailys_finalizadas
    const insertQuery = `
      INSERT INTO dailys_finalizadas 
      (projectId, sprintId, name, description, deliveryDate, tag, finalizado_por) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await transaction.execute({
      sql: insertQuery,
      args: [
        daily.projectId,
        daily.sprintId,
        daily.name,
        daily.description,
        daily.deliveryDate,
        daily.tag || 'Concluido', // Default to 'Concluido' if no tag
        userId,
      ],
    });

    // Step 3: Delete from dailys
    const deleteQuery = 'DELETE FROM dailys WHERE id = ?';
    const deleteResult = await transaction.execute({
      sql: deleteQuery,
      args: [dailyId],
    });

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: 'Daily finalizada com sucesso',
      deletedDailyId: dailyId,
    });
  } catch (error) {
    // Rollback the transaction in case of any error
    await transaction.rollback();

    console.error('Erro ao finalizar daily:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.user.id;

  // Start a transaction
  const db = conexao;
  const transaction = await db.transaction();

  try {
    // 1. Delete user's project memberships
    await transaction.execute({
      sql: 'DELETE FROM projeto_usuarios WHERE userId = ?',
      args: [userId],
    });

    // 2. Find projects created by the user
    const projectsResult = await transaction.execute({
      sql: 'SELECT id FROM projetos WHERE criado_por = ?',
      args: [userId],
    });

    const projectIds = projectsResult.rows.map((row) => row.id);

    if (projectIds.length > 0) {
      // 3. Delete project-related entries
      const projectPlaceholders = projectIds.map(() => '?').join(',');

      // Delete project members
      await transaction.execute({
        sql: `DELETE FROM projeto_usuarios WHERE projectId IN (${projectPlaceholders})`,
        args: projectIds,
      });

      // Delete dailys
      await transaction.execute({
        sql: `DELETE FROM dailys WHERE projectId IN (${projectPlaceholders})`,
        args: projectIds,
      });

      // Delete sprints
      await transaction.execute({
        sql: `DELETE FROM sprints WHERE projectId IN (${projectPlaceholders})`,
        args: projectIds,
      });

      // Delete finalized sprints
      await transaction.execute({
        sql: `DELETE FROM sprintsfinalizadas WHERE projectId IN (${projectPlaceholders})`,
        args: projectIds,
      });

      // Delete projects
      await transaction.execute({
        sql: 'DELETE FROM projetos WHERE criado_por = ?',
        args: [userId],
      });
    }

    // 4. Delete user's personal entries
    await transaction.execute({
      sql: 'DELETE FROM dailys WHERE criado_por = ?',
      args: [userId],
    });

    await transaction.execute({
      sql: 'DELETE FROM sprints WHERE criado_por = ?',
      args: [userId],
    });

    await transaction.execute({
      sql: 'DELETE FROM sprintsfinalizadas WHERE finalizado_por = ?',
      args: [userId],
    });

    // 5. Finally, delete the user
    const deleteUserResult = await transaction.execute({
      sql: 'DELETE FROM usuarios WHERE id = ?',
      args: [userId],
    });

    // Verify deletion
    if (deleteUserResult.rowsAffected === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Commit the transaction
    await transaction.commit();

    // Clear authentication cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
    });

    res.status(200).json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    // Rollback the transaction
    await transaction.rollback();

    console.error('Erro detalhado ao excluir conta:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    res.status(500).json({
      error: 'Erro ao excluir conta',
      details: error.message,
    });
  }
};

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  try {
    const selectProjectQuery = `
      SELECT p.*, 
             GROUP_CONCAT(pu.userId) AS projectMembers 
      FROM projetos p
      LEFT JOIN projeto_usuarios pu ON p.id = pu.projectId
      WHERE p.id = ?
      GROUP BY p.id
    `;

    const projectResult = await conexao.execute({
      sql: selectProjectQuery,
      args: [projectId],
    });

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.status(200).json(projectResult.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// calendario
export const createEvent = async (req, res) => {
  const { title, start, end, description } = req.body;
  const userId = req.user.id;

  try {
    // Ensure only date is stored if no specific time is provided
    const formattedStart = start.includes('T')
      ? new Date(start).toISOString()
      : new Date(start).toISOString().split('T')[0];

    const formattedEnd = end
      ? end.includes('T')
        ? new Date(end).toISOString()
        : new Date(end).toISOString().split('T')[0]
      : null;

    const query = `
      INSERT INTO events 
      (title, start, end, description, user_id) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await conexao.execute({
      sql: query,
      args: [title, formattedStart, formattedEnd, description, userId],
    });

    res.status(201).json({
      id: result.lastInsertRowid,
      title,
      start: formattedStart,
      end: formattedEnd,
      description,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Error creating event' });
  }
};

export const getAllEvents = async (req, res) => {
  // Add logging to help diagnose the issue
  console.log('Event Request User:', req.user);

  // Validate that user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: 'Usuário não autenticado',
      details: 'Não foi possível identificar o usuário a partir do token',
    });
  }

  const userId = req.user.id;

  try {
    const query = `SELECT * FROM events WHERE user_id = ?`;
    const result = await conexao.execute({
      sql: query,
      args: [userId],
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Detailed error fetching events:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({
      error: 'Erro ao buscar eventos',
      details: error.message,
    });
  }
};

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, start, end, description } = req.body;
  const userId = req.user.id;

  try {
    // Strict validation to prevent unauthorized modifications
    const existingEventQuery = 'SELECT * FROM events WHERE id = ? AND user_id = ?';
    const existingEventResult = await conexao.execute({
      sql: existingEventQuery,
      args: [id, userId],
    });

    if (existingEventResult.rows.length === 0) {
      return res.status(403).json({
        error: 'Não autorizado a modificar este evento',
      });
    }

    // Preserve original event details
    const originalEvent = existingEventResult.rows[0];

    // Only allow specific fields to be updated
    const query = `
      UPDATE events 
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description)
      WHERE id = ? AND user_id = ?
    `;

    await conexao.execute({
      sql: query,
      args: [title || originalEvent.title, description || originalEvent.description, id, userId],
    });

    res.status(200).json({
      message: 'Evento atualizado com sucesso',
      event: {
        ...originalEvent,
        title: title || originalEvent.title,
        description: description || originalEvent.description,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const query = `DELETE FROM events WHERE id = ? AND user_id = ?`;
    const result = await conexao.execute({
      sql: query,
      args: [id, userId],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        error: 'Evento não encontrado ou você não tem permissão para excluí-lo',
      });
    }

    res.status(200).json({
      message: 'Evento deletado com sucesso',
      deletedEventId: id,
    });
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    res.status(500).json({
      error: 'Erro ao deletar evento',
      details: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `SELECT * FROM events WHERE id = ?`;
    const result = await conexao.execute({
      sql: query,
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Error fetching event' });
  }
};

export const updateEventDate = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { newDate } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!eventId || !newDate) {
      return res.status(400).json({
        error: 'ID do evento e nova data são obrigatórios',
      });
    }

    // Find the existing event
    const findEventQuery = 'SELECT * FROM events WHERE id = ? AND user_id = ?';
    const eventResult = await conexao.execute({
      sql: findEventQuery,
      args: [eventId, userId],
    });

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Evento não encontrado',
      });
    }

    const existingEvent = eventResult.rows[0];

    // Prepare the update query - use the exact date string
    const updateQuery = 'UPDATE events SET start = ?, end = ? WHERE id = ? AND user_id = ?';
    const updateResult = await conexao.execute({
      sql: updateQuery,
      args: [
        newDate, // Use the exact date string
        existingEvent.end ? newDate : null, // Preserve original end logic
        eventId,
        userId,
      ],
    });

    // Verify the update
    if (updateResult.rowsAffected === 0) {
      return res.status(500).json({
        error: 'Falha ao atualizar o evento',
      });
    }

    // Fetch the updated event
    const updatedEventQuery = 'SELECT * FROM events WHERE id = ?';
    const updatedEventResult = await conexao.execute({
      sql: updatedEventQuery,
      args: [eventId],
    });

    res.status(200).json({
      message: 'Data do evento atualizada com sucesso',
      event: updatedEventResult.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar data do evento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message,
    });
  }
};
