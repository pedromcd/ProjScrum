import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { conexao } from '../config/database.js';
import { generateToken, setCookieToken } from '../utils/tokenUtils.js';

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

    // Set cookie with the token
    setCookieToken(res, token);

    res.status(200).json({
      id: user.id,
      nome: user.nome,
      email: user.email,
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

    if (imagem) {
      query += ', imagem = ?';
      params.push(imagem);
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

  console.log('Received update role request:', { userId, role }); // Detailed logging

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

    // Update user role in the database
    const updateQuery = 'UPDATE usuarios SET cargo = ? WHERE id = ?';

    try {
      const result = await conexao.execute({
        sql: updateQuery,
        args: [role, userId],
      });

      console.log('Update result:', result); // Log the full result

      // Check if any rows were actually updated
      if (result.rowsAffected === 0) {
        console.error('No rows updated - User not found', { userId, role });
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Fetch the updated user to return
      const getUserQuery = 'SELECT id, nome, email, cargo FROM usuarios WHERE id = ?';
      const userResult = await conexao.execute({
        sql: getUserQuery,
        args: [userId],
      });

      // Additional check for user retrieval
      if (userResult.rows.length === 0) {
        console.error('User not found after update', { userId });
        return res.status(404).json({ error: 'Usuário não encontrado após atualização' });
      }

      res.status(200).json({
        message: 'Cargo do usuário atualizado com sucesso',
        user: userResult.rows[0],
      });
    } catch (updateError) {
      console.error('Database update error:', updateError);
      res.status(500).json({
        error: 'Erro ao atualizar cargo no banco de dados',
        details: updateError.message,
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar cargo do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message,
    });
  }
};

export const getProjetos = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming your token payload uses 'id'
    const selectProj = 'SELECT * FROM projetos WHERE criado_por = ?';

    const result = await conexao.execute({
      sql: selectProj,
      args: [userId],
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
};

export const criarProjeto = async (req, res) => {
  console.log('Create Project Request Received');
  console.log('Request Body:', req.body);
  console.log('User from Token:', req.user);

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

    // Add project members
    if (projectMembers && projectMembers.length > 0) {
      const membersQuery = `
                INSERT INTO projeto_usuarios (projectId, userId) 
                VALUES ${projectMembers.map(() => '(?, ?)').join(', ')}
            `;

      // Flatten the array for args
      const membersArgs = projectMembers.flatMap((memberId) => [projectId, memberId]);

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
  console.log('Delete Project Request Received');
  console.log('Request Body:', req.body);
  console.log('User from Token:', req.user);

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

    console.log('Detailed Project Information:', {
      projectId: project.id,
      projectName: project.projectName,
      projectOwnerId: project.criado_por,
      projectOwnerName: project.owner_name,
      projectOwnerRole: project.owner_role,
      currentUserId: userId,
      currentUserName: project.current_user_name,
      currentUserRole: project.current_user_role,
    });

    // Check project ownership or admin privileges
    const isProjectOwner = project.criado_por === userId;
    const isAdmin = project.current_user_role === 'Admin';
    const isManagerOrAdmin = ['Admin', 'Gerente'].includes(project.current_user_role);

    console.log('Deletion Permissions:', {
      isProjectOwner,
      isAdmin,
      isManagerOrAdmin,
    });

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

    console.log('Deletion successful:', deleteResult);

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
