import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id, // Use 'id' instead of 'codigoUser'
      email: user.email,
      nome: user.nome,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const setCookieToken = (res, token) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'Lax', // This should allow the cookie to be sent with requests
    path: '/', // Ensure cookie is set for the entire site
  });
};
