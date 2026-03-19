import { Result, failure } from '../../../../core/result/result';
import { Bill } from '../entities/bill.entity';
import { ClientProviderPort, ResolveClientInput } from '../ports/client-provider.port';
import { CreateDraftBillUseCase } from './create-draft-bill.usecase';

export type SubmitNewBillInput = ResolveClientInput;

export class SubmitNewBillUseCase {
  constructor(
    private readonly clientProvider: ClientProviderPort,
    private readonly createDraftBillUseCase: CreateDraftBillUseCase
  ) {}

  async execute(input: SubmitNewBillInput): Promise<Result<Bill>> {
    try {
      const clientResult = await this.clientProvider.resolveClient(input);
      if (!clientResult.success) {
        return failure(clientResult.error.code, clientResult.error.message);
      }

      return await this.createDraftBillUseCase.execute(clientResult.data);
    } catch (e: any) {
      return failure('SUBMIT_BILL_ERROR', e.message || 'Une erreur inattendue est survenue');
    }
  }
}
