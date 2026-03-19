import { Bill } from '../entities/bill.entity';
import { Result, failure, success } from '../../../../core/result/result';
import { CreateEnrichedBillInput, CreateEnrichedBillUseCase } from './create-enriched-bill.usecase';
import { SubmitNewBillUseCase } from './submit-new-bill.usecase';
import { BillRepository } from '../ports/bill.repository';
import { ClientProviderPort, ResolveClientInput } from '../ports/client-provider.port';
import { ReferenceGeneratorService } from '../ports/reference-generator.service';

class DummyClientProvider implements ClientProviderPort {
  async resolveClient(_input: ResolveClientInput): Promise<Result<string>> {
    return success('client-1');
  }
}

class DummyBillRepository implements BillRepository {
  async save(_bill: Bill): Promise<void> {
    return;
  }
}

class DummyReferenceGenerator implements ReferenceGeneratorService {
  async generate(): Promise<string> {
    return 'F-TEST';
  }
}

class SpyCreateEnrichedBillUseCase extends CreateEnrichedBillUseCase {
  lastInput: CreateEnrichedBillInput | null = null;
  nextResult: Result<Bill> = success(new Bill('b-1', 'F-2026-0001', 'client-1'));

  constructor() {
    super(new DummyClientProvider(), new DummyBillRepository(), new DummyReferenceGenerator());
  }

  override async execute(input: CreateEnrichedBillInput): Promise<Result<Bill>> {
    this.lastInput = input;
    return this.nextResult;
  }
}

describe('SubmitNewBillUseCase', () => {
  it('routes existing client mode to enriched use case with full payload', async () => {
    const createEnriched = new SpyCreateEnrichedBillUseCase();
    const useCase = new SubmitNewBillUseCase(createEnriched);

    const result = await useCase.execute({
      clientMode: 'EXISTING',
      clientId: 'client-123',
      amountTTC: 2200,
      dueDate: '2026-05-01',
      externalInvoiceReference: 'EXT-44',
      type: 'Situation',
      paymentMode: 'Virement'
    });

    expect(result.success).toBe(true);
    expect(createEnriched.lastInput).toEqual({
      isNewClient: false,
      clientIdOrName: 'client-123',
      amountTTC: 2200,
      dueDate: '2026-05-01',
      externalInvoiceReference: 'EXT-44',
      type: 'Situation',
      paymentMode: 'Virement'
    });
  });

  it('routes new client mode to enriched use case with full payload', async () => {
    const createEnriched = new SpyCreateEnrichedBillUseCase();
    const useCase = new SubmitNewBillUseCase(createEnriched);

    const result = await useCase.execute({
      clientMode: 'NEW',
      newClientName: 'Alice',
      clientEmail: 'alice@example.com',
      amountTTC: 1800,
      dueDate: '2026-05-10',
      externalInvoiceReference: 'EXT-99',
      type: 'Solde',
      paymentMode: 'Chèque'
    });

    expect(result.success).toBe(true);
    expect(createEnriched.lastInput).toEqual({
      isNewClient: true,
      clientIdOrName: 'Alice',
      clientEmail: 'alice@example.com',
      amountTTC: 1800,
      dueDate: '2026-05-10',
      externalInvoiceReference: 'EXT-99',
      type: 'Solde',
      paymentMode: 'Chèque'
    });
  });

  it('propagates business failure from enriched use case', async () => {
    const createEnriched = new SpyCreateEnrichedBillUseCase();
    createEnriched.nextResult = failure('INVALID_AMOUNT', 'Le montant est invalide');
    const useCase = new SubmitNewBillUseCase(createEnriched);

    const result = await useCase.execute({
      clientMode: 'EXISTING',
      clientId: 'client-123',
      amountTTC: -1,
      dueDate: '2026-05-01',
      externalInvoiceReference: 'EXT-44',
      type: 'Situation',
      paymentMode: 'Virement'
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }
    expect(result.error.code).toBe('INVALID_AMOUNT');
    expect(result.error.message).toBe('Le montant est invalide');
  });
});
