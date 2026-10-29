import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function start(): Promise<void> {
  await connectDatabase(env.mongoUri);
  app.listen(env.port, () => {
    console.info(`API listening on http://localhost:${env.port}`);
  });
}

start().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
