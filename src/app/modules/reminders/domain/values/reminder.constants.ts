import { ReminderScenario } from '../entities/reminder-scenario.entity';

export const STANDARD_REMINDER_SCENARIO_ID = 'standard-reminder-scenario';
export const STANDARD_REMINDER_SCENARIO_NAME = 'Standard – J-3, J+3, J+10';
export const STANDARD_REMINDER_SCENARIO_STEPS = [-3, 3, 10] as const;

/**
 * Construire le scénario standard figé utilisé par défaut dans la saisie facture.
 */
export function buildStandardReminderScenario(): ReminderScenario {
  return new ReminderScenario(
    STANDARD_REMINDER_SCENARIO_ID,
    STANDARD_REMINDER_SCENARIO_NAME,
    [...STANDARD_REMINDER_SCENARIO_STEPS]
  );
}
