import { Injectable } from '@angular/core';
import { Chantier } from '../domain/entities/chantier.entity';
import { ChantierPersistenceError } from '../domain/errors/chantier-persistence.error';
import { ChantierRepository } from '../domain/ports/chantier.repository';
import { FirestoreChantierDataSource, FirestorePlainChantier } from './firestore-chantier.datasource';

@Injectable({ providedIn: 'root' })
export class FirestoreChantierRepository implements ChantierRepository {
  private readonly collectionName = 'chantiers';

  constructor(private readonly dataSource: FirestoreChantierDataSource) {}

  async save(chantier: Chantier): Promise<void> {
    try {
      const ownerUid = this.getOwnerUid();
      await this.dataSource.saveById(chantier.id, this.toPlainChantier(chantier, ownerUid));
    } catch (error: unknown) {
      throw new ChantierPersistenceError(undefined, { collection: this.collectionName, chantierId: chantier.id }, error);
    }
  }

  async list(): Promise<Chantier[]> {
    try {
      const ownerUid = this.getOwnerUid();
      const snapshot = await this.dataSource.readAll();
      return snapshot.docs
        .map((entry) => entry.data() as FirestorePlainChantier)
        .filter((plainChantier) => plainChantier.ownerUid === ownerUid)
        .map((plainChantier) => this.toEntity(plainChantier));
    } catch (error: unknown) {
      throw new ChantierPersistenceError('Impossible de lire les chantiers.', { collection: this.collectionName }, error);
    }
  }

  async update(chantier: Chantier): Promise<void> {
    try {
      const ownerUid = this.getOwnerUid();
      const existing = await this.dataSource.readById(chantier.id);
      if (!existing.exists()) {
        throw new ChantierPersistenceError('Chantier introuvable pour mise à jour.', { chantierId: chantier.id });
      }

      const existingData = existing.data() as FirestorePlainChantier;
      if (existingData.ownerUid !== ownerUid) {
        throw new ChantierPersistenceError('Chantier introuvable pour mise à jour.', { chantierId: chantier.id });
      }

      await this.dataSource.saveById(chantier.id, this.toPlainChantier(chantier, ownerUid));
    } catch (error: unknown) {
      if (error instanceof ChantierPersistenceError) {
        throw error;
      }
      throw new ChantierPersistenceError('Impossible de mettre à jour le chantier.', { collection: this.collectionName, chantierId: chantier.id }, error);
    }
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    try {
      const normalizedName = name.trim().toLowerCase();
      const chantiers = await this.list();
      return chantiers.some((chantier) => chantier.name.trim().toLowerCase() === normalizedName && chantier.id !== excludeId);
    } catch (error: unknown) {
      if (error instanceof ChantierPersistenceError) {
        throw error;
      }
      throw new ChantierPersistenceError('Impossible de vérifier l’unicité du chantier.', { collection: this.collectionName, name, excludeId }, error);
    }
  }

  private toEntity(plain: FirestorePlainChantier): Chantier {
    return new Chantier(plain.id, plain.name);
  }

  private toPlainChantier(chantier: Chantier, ownerUid: string): FirestorePlainChantier {
    return {
      id: chantier.id,
      ownerUid,
      name: chantier.name
    };
  }

  private getOwnerUid(): string {
    const currentUser = this.dataSource.getCurrentUser();
    if (!currentUser?.uid) {
      throw new ChantierPersistenceError('Utilisateur non authentifié.', { collection: this.collectionName });
    }

    return currentUser.uid;
  }
}
