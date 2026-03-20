import { InvalidReminderScenarioNameError } from '../errors/invalid-reminder-scenario-name.error';
import { InvalidReminderStepsError } from '../errors/invalid-reminder-steps.error';

export class ReminderScenario {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _steps: number[];

  constructor(id: string, name: string, steps: number[]) {
    if (!id || id.trim().length === 0) {
      throw new InvalidReminderScenarioNameError("L'identifiant du scénario est requis.");
    }
    if (!name || name.trim().length === 0) {
      throw new InvalidReminderScenarioNameError();
    }
    if (!steps.length) {
      throw new InvalidReminderStepsError('Un scénario de relance doit contenir au moins une échéance.');
    }

    const normalizedSteps = [...steps].sort((a, b) => a - b);
    const hasDuplicates = new Set(normalizedSteps).size !== normalizedSteps.length;

    if (hasDuplicates) {
      throw new InvalidReminderStepsError('Les échéances de relance doivent être uniques.');
    }

    this._id = id;
    this._name = name;
    this._steps = normalizedSteps;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get steps(): number[] {
    return [...this._steps];
  }
}
