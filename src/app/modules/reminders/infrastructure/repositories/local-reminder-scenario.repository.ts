import { Injectable } from '@angular/core';
import { ReminderScenario } from '../../domain/entities/reminder-scenario.entity';
import { ReminderPersistenceError } from '../../domain/errors/reminder-persistence.error';
import { ReminderScenarioRepository } from '../../domain/ports/reminder-scenario.repository';

@Injectable({ providedIn: 'root' })
export class LocalReminderScenarioRepository extends ReminderScenarioRepository {
  private readonly storageKey = 'btp_reminder_scenarios';

  async findByName(name: string): Promise<ReminderScenario | null> {
    const scenarios = await this.list();
    return scenarios.find((scenario) => scenario.name === name) ?? null;
  }

  async save(scenario: ReminderScenario): Promise<void> {
    try {
      const rawData = localStorage.getItem(this.storageKey);
      const scenarios = rawData
        ? (JSON.parse(rawData) as Array<{ id: string; name: string; steps: number[] }>)
        : [];

      scenarios.push({
        id: scenario.id,
        name: scenario.name,
        steps: scenario.steps
      });

      localStorage.setItem(this.storageKey, JSON.stringify(scenarios));
    } catch (error: unknown) {
      throw new ReminderPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }

  async list(): Promise<ReminderScenario[]> {
    try {
      const rawData = localStorage.getItem(this.storageKey);

      if (!rawData) {
        return [];
      }

      const scenarios = JSON.parse(rawData) as Array<{ id: string; name: string; steps: number[] }>;
      return scenarios.map((scenario) => new ReminderScenario(scenario.id, scenario.name, scenario.steps));
    } catch (error: unknown) {
      throw new ReminderPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }
}
