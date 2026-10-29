import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is required. Copy .env.example to .env and configure it.');
}

const seedPassword = process.env.SEED_PASSWORD;
if (!seedPassword || seedPassword.length < 8) {
  throw new Error('SEED_PASSWORD must be set and at least 8 characters long');
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 24) throw new Error('JWT_SECRET must be set and at least 24 characters long');

export const env = { port, mongoUri, jwtSecret, corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', seedPassword: process.env.SEED_PASSWORD ?? 'ChangeMe123!' };
