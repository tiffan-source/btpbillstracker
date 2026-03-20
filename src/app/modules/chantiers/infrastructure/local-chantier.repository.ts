import { Injectable } from '@angular/core';
import { Chantier } from '../domain/entities/chantier.entity';
import { ChantierPersistenceError } from '../domain/errors/chantier-persistence.error';
import { ChantierRepository } from '../domain/ports/chantier.repository';

type PlainChantier = {
  id: string;
  name: string;
};

@Injectable({ providedIn: 'root' })
export class LocalChantierRepository implements ChantierRepository {
  private readonly storageKey = 'btp_chantiers';

  async save(chantier: Chantier): Promise<void> {
    try {
      const chantiers = this.readPlainChantiers();
      chantiers.push(this.toPlainChantier(chantier));
      localStorage.setItem(this.storageKey, JSON.stringify(chantiers));
    } catch (error: unknown) {
      throw new ChantierPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }

  async list(): Promise<Chantier[]> {
    try {
      return this.readPlainChantiers().map((plainChantier) => new Chantier(plainChantier.id, plainChantier.name));
    } catch (error: unknown) {
      throw new ChantierPersistenceError('Impossible de lire les chantiers.', { storageKey: this.storageKey }, error);
    }
  }

  async update(chantier: Chantier): Promise<void> {
    try {
      const chantiers = this.readPlainChantiers();
      const index = chantiers.findIndex((storedChantier) => storedChantier.id === chantier.id);
      if (index < 0) {
        throw new ChantierPersistenceError('Chantier introuvable pour mise à jour.', { chantierId: chantier.id });
      }

      chantiers[index] = this.toPlainChantier(chantier);
      localStorage.setItem(this.storageKey, JSON.stringify(chantiers));
    } catch (error: unknown) {
      if (error instanceof ChantierPersistenceError) {
        throw error;
      }
      throw new ChantierPersistenceError('Impossible de mettre à jour le chantier.', { storageKey: this.storageKey }, error);
    }
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const normalizedName = name.trim().toLowerCase();
    const chantiers = this.readPlainChantiers();
    return chantiers.some((chantier) => chantier.name.trim().toLowerCase() === normalizedName && chantier.id !== excludeId);
  }

  private readPlainChantiers(): PlainChantier[] {
    const rawData = localStorage.getItem(this.storageKey);
    return rawData ? JSON.parse(rawData) : [];
  }

  private toPlainChantier(chantier: Chantier): PlainChantier {
    return {
      id: chantier.id,
      name: chantier.name
    };
  }
}

