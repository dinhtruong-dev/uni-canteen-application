import { EventEmitter } from 'events';
import { Response } from 'express';

class RealtimeService extends EventEmitter {
  private static instance: RealtimeService;
  private sseClients: Map<string, Response[]> = new Map(); // userId -> list of SSE responses

  private constructor() {
    super();
  }

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  public registerClient(userId: string, res: Response) {
    const clients = this.sseClients.get(userId) || [];
    clients.push(res);
    this.sseClients.set(userId, clients);

    // Remove client on disconnect
    res.on('close', () => {
      const current = this.sseClients.get(userId) || [];
      this.sseClients.set(
        userId,
        current.filter((c) => c !== res)
      );
    });
  }

  public sendToUser(userId: string, event: string, data: any) {
    const clients = this.sseClients.get(userId) || [];
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
      client.write(payload);
    }
  }

  public broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [, clientList] of this.sseClients.entries()) {
      for (const client of clientList) {
        client.write(payload);
      }
    }
  }
}

export const realtimeService = RealtimeService.getInstance();
