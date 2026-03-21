import { Injectable } from '@angular/core';
import { Chantier } from '../domain/entities/chantier.entity';
import { ChantierPersistenceError } from '../domain/errors/chantier-persistence.error';
import { ChantierRepository } from '../domain/ports/chantier.repository';

@Injectable({ providedIn: 'root' })
export class FirestoreChantierRepository implements ChantierRepository {
  /**
   * Placeholder pour la phase bootstrap (#47).
   * L'implémentation Firestore complète arrive sur l'issue de migration verticale chantiers.
   */
  async save(_chantier: Chantier): Promise<void> {
    throw new ChantierPersistenceError('Firestore repository is not implemented yet.');
  }

  async list(): Promise<Chantier[]> {
    throw new ChantierPersistenceError('Firestore repository is not implemented yet.');
  }

  async update(_chantier: Chantier): Promise<void> {
    throw new ChantierPersistenceError('Firestore repository is not implemented yet.');
  }

  async existsByName(_name: string, _excludeId?: string): Promise<boolean> {
    throw new ChantierPersistenceError('Firestore repository is not implemented yet.');
  }
}
