import { Injectable } from '@angular/core';
import { Client } from '../domain/entities/client.entity';
import { ClientPersistenceError } from '../domain/errors/client-persistence.error';
import { ClientRepository } from '../domain/ports/client.repository';
import { FirestoreClientDataSource, FirestorePlainClient } from './firestore-client.datasource';

@Injectable({ providedIn: 'root' })
export class FirestoreClientRepository implements ClientRepository {
  private readonly collectionName = 'clients';

  constructor(private readonly dataSource: FirestoreClientDataSource) {}

  async save(client: Client): Promise<void> {
    try {
      const plainClient = this.toPlainClient(client);
      await this.dataSource.saveById(client.id, plainClient);
    } catch (error: unknown) {
      throw new ClientPersistenceError(undefined, { collection: this.collectionName, clientId: client.id }, error);
    }
  }

  async list(): Promise<Client[]> {
    try {
      const snapshot = await this.dataSource.readAll();
      return snapshot.docs.map((item) => this.toEntity(item.data() as FirestorePlainClient));
    } catch (error: unknown) {
      throw new ClientPersistenceError('Impossible de lire les clients.', { collection: this.collectionName }, error);
    }
  }

  async update(client: Client): Promise<void> {
    try {
      const existing = await this.dataSource.readById(client.id);

      if (!existing.exists()) {
        throw new ClientPersistenceError('Client introuvable pour mise à jour.', { clientId: client.id });
      }

      await this.dataSource.saveById(client.id, this.toPlainClient(client));
    } catch (error: unknown) {
      if (error instanceof ClientPersistenceError) {
        throw error;
      }
      throw new ClientPersistenceError('Impossible de mettre à jour le client.', { collection: this.collectionName, clientId: client.id }, error);
    }
  }

  private toEntity(plainClient: FirestorePlainClient): Client {
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
  }

  private toPlainClient(client: Client): FirestorePlainClient {
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
