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
    const [existingUsers] = await new Promise((resolve, reject) => {
      conexao.query(checkUserQuery, [email], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    if (existingUsers) {
      return res.status(400).json({ error: 'Usuário já cadastrado' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Insert new user
    const insertUserQuery = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    await new Promise((resolve, reject) => {
      conexao.query(insertUserQuery, [nome, email, hashedPassword], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
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

    const [user] = await new Promise((resolve, reject) => {
      conexao.query(findUserQuery, [email], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = generateToken(user);

    // Set cookie with the token
    setCookieToken(res, token);

    res.status(200).json({
      id: user.id, // Use 'id' instead of 'codigoUser'
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
      sameSite: 'None',
    });

    res.status(200).json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro no logout' });
  }
};

export const usuarioLogado = (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Erro ao verificar token:', err);
      return res.status(401).json({ error: 'Token inválido' });
    }

    const sqlUserData = 'SELECT id as codigoUser, nome, email, imagem FROM usuarios WHERE email = ?';
    conexao.query(sqlUserData, [decoded.email], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Erro ao buscar os dados do usuário' });
      }
      if (results.length < 1) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.status(200).json(results[0]);
    });
  });
};

export const updateUser = async (req, res) => {
  const { id } = req.user; // Ensure you get the user ID from the token
  const { nome, senha, imagem, email } = req.body; // Include email

  try {
    // If password is provided, hash it
    let hashedPassword;
    if (senha) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(senha, saltRounds);
    }

    // Prepare the update query
    let query = 'UPDATE usuarios SET nome = ?, email = ?'; // Update email
    let params = [nome, email]; // Include email in params

    // Add password update if provided
    if (senha) {
      query += ', senha = ?';
      params.push(hashedPassword);
    }

    // Add image update if provided
    if (imagem) {
      query += ', imagem = ?';
      params.push(imagem);
    }

    query += ' WHERE id = ?';
    params.push(id);

    // Execute the update
    const result = await new Promise((resolve, reject) => {
      conexao.query(query, params, (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    // Check if any rows were actually updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Fetch updated user data
    const getUserQuery = 'SELECT id, nome, email, imagem FROM usuarios WHERE id = ?';
    const [updatedUser] = await new Promise((resolve, reject) => {
      conexao.query(getUserQuery, [id], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    res.status(200).json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const query = 'SELECT id, nome, email FROM usuarios';
    const users = await new Promise((resolve, reject) => {
      conexao.query(query, (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    res.status(200).json(users);
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
    const result = await new Promise((resolve, reject) => {
      conexao.query(updateQuery, [role, userId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    // Check if any rows were actually updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Fetch the updated user to return
    const getUserQuery = 'SELECT id, nome, email, cargo FROM usuarios WHERE id = ?';
    const [updatedUser] = await new Promise((resolve, reject) => {
      conexao.query(getUserQuery, [userId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    res.status(200).json({
      message: 'Cargo do usuário atualizado com sucesso',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Erro ao atualizar cargo do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
