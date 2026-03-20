import { CoreError } from '../../../../core/errors/core.error';

export class ReminderScenarioRequiredError extends CoreError {
  constructor(message = 'Un scénario de relance est requis lorsque les relances automatiques sont activées.') {
    super('REMINDER_SCENARIO_REQUIRED', message);
  }
}
