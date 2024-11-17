import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      cargo: decoded.cargo,
    };

    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
};
