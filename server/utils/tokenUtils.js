import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      nome: user.nome,
      cargo: user.cargo || 'Usuário',
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const setCookieToken = (res, token) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'Lax',
    path: '/',
  });
};
