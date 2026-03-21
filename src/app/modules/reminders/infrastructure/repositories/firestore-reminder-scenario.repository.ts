import { Injectable } from '@angular/core';
import { ReminderScenario } from '../../domain/entities/reminder-scenario.entity';
import { ReminderPersistenceError } from '../../domain/errors/reminder-persistence.error';
import { ReminderScenarioRepository } from '../../domain/ports/reminder-scenario.repository';
import {
  FirestorePlainReminderScenario,
  FirestoreReminderScenarioDataSource
} from './firestore-reminder-scenario.datasource';

@Injectable({ providedIn: 'root' })
export class FirestoreReminderScenarioRepository extends ReminderScenarioRepository {
  private readonly collectionName = 'reminder_scenarios';

  constructor(private readonly dataSource: FirestoreReminderScenarioDataSource) {
    super();
  }

  async findByName(name: string): Promise<ReminderScenario | null> {
    const scenarios = await this.list();
    return scenarios.find((scenario) => scenario.name === name) ?? null;
  }

  async save(scenario: ReminderScenario): Promise<void> {
    try {
      const ownerUid = this.getOwnerUid();
      await this.dataSource.saveById(scenario.id, this.toPlainScenario(scenario, ownerUid));
    } catch (error: unknown) {
      throw new ReminderPersistenceError(undefined, { collection: this.collectionName, reminderScenarioId: scenario.id }, error);
    }
  }

  async list(): Promise<ReminderScenario[]> {
    try {
      const ownerUid = this.getOwnerUid();
      const snapshot = await this.dataSource.readAll();
      return snapshot.docs
        .map((entry) => entry.data() as FirestorePlainReminderScenario)
        .filter((plainScenario) => plainScenario.ownerUid === ownerUid)
        .map((plainScenario) => this.toEntity(plainScenario))
        .sort((first, second) => first.name.localeCompare(second.name, 'fr', { sensitivity: 'base' }));
    } catch (error: unknown) {
      throw new ReminderPersistenceError('Impossible de lire les scénarios de relance.', { collection: this.collectionName }, error);
    }
  }

  private toEntity(plainScenario: FirestorePlainReminderScenario): ReminderScenario {
    return new ReminderScenario(plainScenario.id, plainScenario.name, plainScenario.steps);
  }

  private toPlainScenario(scenario: ReminderScenario, ownerUid: string): FirestorePlainReminderScenario {
    return {
      id: scenario.id,
      ownerUid,
      name: scenario.name,
      steps: scenario.steps
    };
  }

  private getOwnerUid(): string {
    const currentUser = this.dataSource.getCurrentUser();
    if (!currentUser?.uid) {
      throw new ReminderPersistenceError('Utilisateur non authentifié.', { collection: this.collectionName });
    }

    return currentUser.uid;
  }
}
