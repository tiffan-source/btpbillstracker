import { Injectable } from '@angular/core';
import { Client } from '../domain/entities/client.entity';
import { ClientPersistenceError } from '../domain/errors/client-persistence.error';
import { ClientRepository } from '../domain/ports/client.repository';

@Injectable({ providedIn: 'root' })
export class FirestoreClientRepository implements ClientRepository {
  /**
   * Placeholder pour la phase bootstrap (#47).
   * L'implémentation Firestore complète arrive sur l'issue de migration verticale clients.
   */
  async save(_client: Client): Promise<void> {
    throw new ClientPersistenceError('Firestore repository is not implemented yet.');
  }

  async list(): Promise<Client[]> {
    throw new ClientPersistenceError('Firestore repository is not implemented yet.');
  }

  async update(_client: Client): Promise<void> {
    throw new ClientPersistenceError('Firestore repository is not implemented yet.');
  }
}
