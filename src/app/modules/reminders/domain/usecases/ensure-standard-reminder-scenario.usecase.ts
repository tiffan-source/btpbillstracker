import { ReminderScenarioRepository } from '../ports/reminder-scenario.repository';
import { buildStandardReminderScenario, STANDARD_REMINDER_SCENARIO_NAME } from '../values/reminder.constants';

/**
 * Garantir la présence du scénario de relance standard.
 */
export class EnsureStandardReminderScenarioUseCase {
  constructor(private readonly repository: ReminderScenarioRepository) {}

  async execute(): Promise<void> {
    const existingScenario = await this.repository.findByName(STANDARD_REMINDER_SCENARIO_NAME);

    if (existingScenario) {
      return;
    }

    await this.repository.save(buildStandardReminderScenario());
  }
}
