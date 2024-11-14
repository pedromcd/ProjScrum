import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { conexao } from '../config/database.js';
import { generateToken, setCookieToken } from '../utils/tokenUtils.js';
import { v4 as uuid } from 'uuid';

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

    const sqlUserData = 'SELECT id, nome, email, imagem FROM usuarios WHERE email = ?';
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

  try {
    // Validate input
    if (!userId || !role) {
      return res.status(400).json({ error: 'Usuário e cargo são obrigatórios' });
    }

    // Update user role in the database
    const updateQuery = 'UPDATE usuarios SET cargo = ? WHERE id = ?';
    const result = await conexao.execute({
      sql: updateQuery,
      args: [role, userId],
    });

    // Check if any rows were actually updated
    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Fetch the updated user to return
    const getUserQuery = 'SELECT id, nome, email, cargo FROM usuarios WHERE id = ?';
    const userResult = await conexao.execute({
      sql: getUserQuery,
      args: [userId],
    });

    res.status(200).json({
      message: 'Cargo do usuário atualizado com sucesso',
      user: userResult.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar cargo do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
