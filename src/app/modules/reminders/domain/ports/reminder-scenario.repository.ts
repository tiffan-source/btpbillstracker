import { ReminderScenario } from '../entities/reminder-scenario.entity';

/**
 * Exposer la persistance des scénarios de relance.
 */
export abstract class ReminderScenarioRepository {
  abstract findByName(name: string): Promise<ReminderScenario | null>;
  abstract save(scenario: ReminderScenario): Promise<void>;
  abstract list(): Promise<ReminderScenario[]>;
}
