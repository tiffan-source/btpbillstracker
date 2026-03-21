import { ReminderScenario } from '../entities/reminder-scenario.entity';
import { ReminderPersistenceError } from '../errors/reminder-persistence.error';
import { ReminderScenarioRepository } from '../ports/reminder-scenario.repository';
import { Result, failure, success } from '../../../../core/result/result';

/**
 * Retourner les scénarios de relance disponibles.
 */
export class ListReminderScenariosUseCase {
  constructor(private readonly repository: ReminderScenarioRepository) {}

  async execute(): Promise<Result<ReminderScenario[]>> {
    try {
      const scenarios = await this.repository.list();
      return success(scenarios);
    } catch (error: unknown) {
      if (error instanceof ReminderPersistenceError) {
        return failure(error.code, error.message, error.metadata);
      }

      const message = error instanceof Error ? error.message : 'Impossible de charger les scénarios de relance.';
      return failure('UNKNOWN_ERROR', message);
    }
  }
}
