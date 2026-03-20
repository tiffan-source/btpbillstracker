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
      const clients = this.readPlainClients();

      const plainClient = this.toPlainClient(client);

      clients.push(plainClient);
      localStorage.setItem(this.storageKey, JSON.stringify(clients));
    } catch (error: unknown) {
      throw new ClientPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }

  async list(): Promise<Client[]> {
    try {
      const clients = this.readPlainClients();
      return clients.map((plainClient) => {
        const client = new Client(plainClient.id, plainClient.name);

        if (plainClient.firstName) {
          client.setFirstName(plainClient.firstName);
        }
        if (plainClient.lastName) {
          client.setLastName(plainClient.lastName);
        }
        if (plainClient.email) {
          client.setEmail(plainClient.email);
        }
        if (plainClient.phone) {
          client.setPhone(plainClient.phone);
        }

        return client;
      });
    } catch (error: unknown) {
      throw new ClientPersistenceError('Impossible de lire les clients.', { storageKey: this.storageKey }, error);
    }
  }

  async update(client: Client): Promise<void> {
    try {
      const clients = this.readPlainClients();
      const index = clients.findIndex((storedClient) => storedClient.id === client.id);
      if (index < 0) {
        throw new ClientPersistenceError('Client introuvable pour mise à jour.', { clientId: client.id });
      }

      clients[index] = this.toPlainClient(client);
      localStorage.setItem(this.storageKey, JSON.stringify(clients));
    } catch (error: unknown) {
      if (error instanceof ClientPersistenceError) {
        throw error;
      }
      throw new ClientPersistenceError('Impossible de mettre à jour le client.', { storageKey: this.storageKey }, error);
    }
  }

  private readPlainClients(): Array<{
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }> {
    const rawData = localStorage.getItem(this.storageKey);
    return rawData ? JSON.parse(rawData) : [];
  }

  private toPlainClient(client: Client): {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } {
    return {
      id: client.id,
      name: client.name,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone
    };
  }
}
