import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  const token = req.cookies.auth_token;

  console.log('Cookies received:', req.cookies);
  console.log('Auth token:', token);

  if (!token) {
    console.log('No token found');
    return res.status(403).json({ error: 'Token não encontrado, acesso negado!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification error:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
};
