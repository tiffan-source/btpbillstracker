import { Injectable } from '@angular/core';
import { ClientRepository } from '../../domain/ports/client.repository';
import { Client } from '../../domain/entities/client.entity';

@Injectable({ providedIn: 'root' })
export class LocalClientRepository implements ClientRepository {
  private readonly storageKey = 'btp_clients';

  async save(client: Client): Promise<void> {
    const rawData = localStorage.getItem(this.storageKey);
    const clients = rawData ? JSON.parse(rawData) : [];

    const plainClient = {
      id: client.id,
      name: client.name,
      email: client.email
    };

    clients.push(plainClient);
    localStorage.setItem(this.storageKey, JSON.stringify(clients));
  }
}
