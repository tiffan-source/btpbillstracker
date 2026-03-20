import { Injectable } from '@angular/core';
import { ClientRepository } from '../domain/ports/client.repository';
import { Client } from '../domain/entities/client.entity';
import { ClientPersistenceError } from '../domain/errors/client-persistence.error';

@Injectable({ providedIn: 'root' })
export class LocalClientRepository implements ClientRepository {
  private readonly storageKey = 'btp_clients';

  /**
   * Sauvegarder un client en stockage local.
   * @throws {ClientPersistenceError} Quand la persistance locale échoue.
   */
  async save(client: Client): Promise<void> {
    try {
      const rawData = localStorage.getItem(this.storageKey);
      const clients = rawData ? JSON.parse(rawData) : [];

      const plainClient = {
        id: client.id,
        name: client.name,
        email: client.email
      };

      clients.push(plainClient);
      localStorage.setItem(this.storageKey, JSON.stringify(clients));
    } catch (error: unknown) {
      throw new ClientPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }
}
