import { CoreError } from '../../../../core/errors/core.error';

export class InvalidReminderScenarioNameError extends CoreError {
  constructor(message = 'Le nom du scénario de relance est invalide.') {
    super('INVALID_REMINDER_SCENARIO_NAME', message);
  }
}
