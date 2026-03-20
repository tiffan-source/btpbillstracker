import { Result, failure, success } from '../../../../core/result/result';
import { Bill, BillStatus } from '../entities/bill.entity';
import { BillAmountBelowMinError } from '../errors/bill-amount-below-min.error';
import { BillDueDateRequiredError } from '../errors/bill-due-date-required.error';
import { BillExternalReferenceRequiredError } from '../errors/bill-external-reference-required.error';
import { BillNotFoundError } from '../errors/bill-not-found.error';
import { BillPersistenceError } from '../errors/bill-persistence.error';
import { InvalidBillReferenceError } from '../errors/invalid-bill-reference.error';
import { InvalidBillTypeError } from '../errors/invalid-bill-type.error';
import { InvalidPaymentModeError } from '../errors/invalid-payment-mode.error';
import { ReminderScenarioRequiredError } from '../errors/reminder-scenario-required.error';
import { BillRepository } from '../ports/bill.repository';

export type UpdateEnrichedBillInput = {
  id: string;
  reference: string;
  clientId: string;
  amountTTC: number;
  dueDate: string;
  externalInvoiceReference: string;
  type: string;
  paymentMode: string;
  chantier?: string;
  remindersAutoEnabled?: boolean;
  reminderScenarioId?: string;
  status: BillStatus;
};

/**
 * Met à jour une facture enrichie existante avec validation des invariants métier.
 */
export class UpdateEnrichedBillUseCase {
  constructor(private readonly repository: BillRepository) {}

  async execute(input: UpdateEnrichedBillInput): Promise<Result<Bill>> {
    try {
      const bill = new Bill(input.id, input.reference, input.clientId)
        .setAmountTTC(input.amountTTC)
        .setDueDate(input.dueDate)
        .setExternalInvoiceReference(input.externalInvoiceReference)
        .setType(input.type)
        .setPaymentMode(input.paymentMode)
        .setChantier(input.chantier ?? '')
        .setStatus(input.status)
        .configureReminder(input.remindersAutoEnabled ?? false, input.reminderScenarioId);

      await this.repository.update(bill);
      return success(bill);
    } catch (error: unknown) {
      if (
        error instanceof InvalidBillReferenceError ||
        error instanceof BillAmountBelowMinError ||
        error instanceof BillDueDateRequiredError ||
        error instanceof BillExternalReferenceRequiredError ||
        error instanceof InvalidBillTypeError ||
        error instanceof InvalidPaymentModeError ||
        error instanceof BillPersistenceError ||
        error instanceof ReminderScenarioRequiredError ||
        error instanceof BillNotFoundError
      ) {
        return failure(error.code, error.message, error.metadata);
      }

      const message = error instanceof Error ? error.message : 'Une erreur inattendue est survenue';
      return failure('UNKNOWN_ERROR', message);
    }
  }
}
