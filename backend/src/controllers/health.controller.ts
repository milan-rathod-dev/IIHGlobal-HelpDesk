import type { Request, Response } from 'express';
import mongoose from 'mongoose';

export function getHealth(_request: Request, response: Response): void {
  const databaseConnected = mongoose.connection.readyState === 1;
  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected'
  });
}
