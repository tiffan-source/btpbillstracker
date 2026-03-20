import { ReminderScenario } from '../entities/reminder-scenario.entity';
import { ReminderScenarioRepository } from '../ports/reminder-scenario.repository';

/**
 * Retourner les scénarios de relance disponibles.
 */
export class ListReminderScenariosUseCase {
  constructor(private readonly repository: ReminderScenarioRepository) {}

  async execute(): Promise<ReminderScenario[]> {
    return this.repository.list();
  }
}
