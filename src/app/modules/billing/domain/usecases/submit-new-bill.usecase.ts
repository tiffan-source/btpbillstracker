import { Result, failure } from '../../../../core/result/result';
import { Bill } from '../entities/bill.entity';
import { CreateEnrichedBillInput, CreateEnrichedBillUseCase } from './create-enriched-bill.usecase';

type SubmitNewBillBaseInput = {
  amountTTC: number;
  dueDate: string;
  externalInvoiceReference: string;
  type: string;
  paymentMode: string;
};

export type SubmitNewBillInput =
  | (SubmitNewBillBaseInput & {
      clientMode: 'EXISTING';
      clientId: string;
    })
  | (SubmitNewBillBaseInput & {
      clientMode: 'NEW';
      newClientName: string;
      clientEmail?: string;
    });

export class SubmitNewBillUseCase {
  constructor(private readonly createEnrichedBillUseCase: CreateEnrichedBillUseCase) {}

  async execute(input: SubmitNewBillInput): Promise<Result<Bill>> {
    try {
      const createInput: CreateEnrichedBillInput =
        input.clientMode === 'EXISTING'
          ? {
              isNewClient: false,
              clientIdOrName: input.clientId,
              amountTTC: input.amountTTC,
              dueDate: input.dueDate,
              externalInvoiceReference: input.externalInvoiceReference,
              type: input.type,
              paymentMode: input.paymentMode
            }
          : {
              isNewClient: true,
              clientIdOrName: input.newClientName,
              clientEmail: input.clientEmail,
              amountTTC: input.amountTTC,
              dueDate: input.dueDate,
              externalInvoiceReference: input.externalInvoiceReference,
              type: input.type,
              paymentMode: input.paymentMode
            };

      return await this.createEnrichedBillUseCase.execute(createInput);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inattendue est survenue';
      return failure('SUBMIT_BILL_ERROR', message);
    }
  }
}
