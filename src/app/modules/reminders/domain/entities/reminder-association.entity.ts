import { CoreError } from '../../../../core/errors/core.error';

class InvalidReminderAssociationError extends CoreError {
  constructor(message = 'Association facture-relance invalide.') {
    super('INVALID_REMINDER_ASSOCIATION', message);
  }
}

export class ReminderAssociation {
  private readonly _billId: string;
  private readonly _reminderScenarioId: string;

  constructor(billId: string, reminderScenarioId: string) {
    if (!billId || billId.trim().length === 0) {
      throw new InvalidReminderAssociationError("L'identifiant de facture est requis.");
    }
    if (!reminderScenarioId || reminderScenarioId.trim().length === 0) {
      throw new InvalidReminderAssociationError("L'identifiant de scénario est requis.");
    }

    this._billId = billId;
    this._reminderScenarioId = reminderScenarioId;
  }

  get billId(): string {
    return this._billId;
  }

  get reminderScenarioId(): string {
    return this._reminderScenarioId;
  }
}
