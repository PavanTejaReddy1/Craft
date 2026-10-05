import crypto from 'crypto';

export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateVerificationToken = () => {
  const token = generateToken(32);
  const hashed = hashToken(token);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { token, hashed, expires };
};

export const generatePasswordResetToken = () => {
  const token = generateToken(32);
  const hashed = hashToken(token);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { token, hashed, expires };
};
