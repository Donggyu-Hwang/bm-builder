import { Response } from 'express';

export interface StreamMessage {
  type: 'progress' | 'complete' | 'error';
  data: unknown;
}

export function sendStream(res: Response, message: StreamMessage) {
  res.write(`data: ${JSON.stringify(message)}\n\n`);
}

export function endStream(res: Response) {
  res.write('data: [DONE]\n\n');
  res.end();
}

export function setupStreamHeaders(res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
}
