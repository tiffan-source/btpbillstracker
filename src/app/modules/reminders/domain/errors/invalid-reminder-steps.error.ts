import { CoreError } from '../../../../core/errors/core.error';

export class InvalidReminderStepsError extends CoreError {
  constructor(message = 'Les étapes du scénario de relance sont invalides.') {
    super('INVALID_REMINDER_STEPS', message);
  }
}
