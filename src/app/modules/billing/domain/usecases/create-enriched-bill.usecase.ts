import { Result, failure, success } from '../../../../core/result/result';
import { Bill } from '../entities/bill.entity';
import { BillAmountBelowMinError } from '../errors/bill-amount-below-min.error';
import { BillDueDateRequiredError } from '../errors/bill-due-date-required.error';
import { BillExternalReferenceRequiredError } from '../errors/bill-external-reference-required.error';
import { BillPersistenceError } from '../errors/bill-persistence.error';
import { InvalidBillReferenceError } from '../errors/invalid-bill-reference.error';
import { InvalidBillTypeError } from '../errors/invalid-bill-type.error';
import { InvalidPaymentModeError } from '../errors/invalid-payment-mode.error';
import { BillRepository } from '../ports/bill.repository';
import { ReminderScenarioRequiredError } from '../errors/reminder-scenario-required.error';
import { ClientProviderPort } from '../ports/client-provider.port';
import { ReferenceGeneratorService } from '../ports/reference-generator.service';
import { IdGeneratorPort } from '../../../../core/ids/id-generator.port';

export type CreateEnrichedBillInput = {
  isNewClient: boolean;
  clientIdOrName: string;
  clientEmail?: string;
  amountTTC: number;
  dueDate: string;
  externalInvoiceReference: string;
  type: string;
  paymentMode: string;
  chantierId?: string;
  remindersAutoEnabled?: boolean;
  reminderScenarioId?: string;
};

/**
 * Crée une facture enrichie en validant les invariants métier du payload.
 */
export class CreateEnrichedBillUseCase {
  constructor(
    private readonly clientProvider: ClientProviderPort,
    private readonly repository: BillRepository,
    private readonly referenceGenerator: ReferenceGeneratorService,
    private readonly idGenerator: IdGeneratorPort
  ) {}

  /**
   * Orchestrer la résolution client, la validation métier et la persistance de la facture.
   */
  async execute(input: CreateEnrichedBillInput): Promise<Result<Bill>> {
    try {
      const clientResult = await this.clientProvider.resolveClient({
        isNewClient: input.isNewClient,
        clientIdOrName: input.clientIdOrName,
        clientEmail: input.clientEmail
      });

      if (!clientResult.success) {
        return failure(clientResult.error.code, clientResult.error.message);
      }

      const reference = await this.referenceGenerator.generate();
      const bill = new Bill(this.idGenerator.generate(), reference, clientResult.data)
        .setAmountTTC(input.amountTTC)
        .setDueDate(input.dueDate)
        .setExternalInvoiceReference(input.externalInvoiceReference)
        .setType(input.type)
        .setPaymentMode(input.paymentMode)
        .setChantierId(input.chantierId ?? '')
        .configureReminder(input.remindersAutoEnabled ?? false, input.reminderScenarioId);

      await this.repository.save(bill);
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
        error instanceof ReminderScenarioRequiredError
      ) {
        return failure(error.code, error.message, error.metadata);
      }

      const message = error instanceof Error ? error.message : 'Une erreur inattendue est survenue';
      return failure('UNKNOWN_ERROR', message);
    }
  }
}
