import { Bill } from '../entities/bill.entity';
import { BillRepository } from '../ports/bill.repository';
import { ClientProviderPort, ResolveClientInput } from '../ports/client-provider.port';
import { ReferenceGeneratorService } from '../ports/reference-generator.service';
import { CreateEnrichedBillUseCase } from './create-enriched-bill.usecase';
import { Result, success } from '../../../../core/result/result';

class InMemoryBillRepository implements BillRepository {
  savedBill: Bill | null = null;

  async save(bill: Bill): Promise<void> {
    this.savedBill = bill;
  }
}

class StaticReferenceGenerator implements ReferenceGeneratorService {
  async generate(): Promise<string> {
    return 'F-2026-0100';
  }
}

class SuccessClientProvider implements ClientProviderPort {
  async resolveClient(input: ResolveClientInput): Promise<Result<string>> {
    return success(input.clientIdOrName === 'Alice' ? 'client-new' : input.clientIdOrName);
  }
}

describe('CreateEnrichedBillUseCase', () => {
  it('creates and saves an enriched bill from a valid payload', async () => {
    const repository = new InMemoryBillRepository();
    const referenceGenerator = new StaticReferenceGenerator();
    const clientProvider = new SuccessClientProvider();
    const useCase = new CreateEnrichedBillUseCase(clientProvider, repository, referenceGenerator);

    const result = await useCase.execute({
      isNewClient: false,
      clientIdOrName: 'client-123',
      amountTTC: 3200,
      dueDate: '2026-04-20',
      externalInvoiceReference: 'EXT-7788',
      type: 'Situation',
      paymentMode: 'Virement'
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.clientId).toBe('client-123');
    expect(result.data.reference).toBe('F-2026-0100');
    expect(result.data.amountTTC).toBe(3200);
    expect(result.data.dueDate).toBe('2026-04-20');
    expect(result.data.externalInvoiceReference).toBe('EXT-7788');
    expect(result.data.type).toBe('Situation');
    expect(result.data.paymentMode).toBe('Virement');
    expect(repository.savedBill).toBe(result.data);
  });

  it('fails when amount TTC is negative', async () => {
    const repository = new InMemoryBillRepository();
    const referenceGenerator = new StaticReferenceGenerator();
    const clientProvider = new SuccessClientProvider();
    const useCase = new CreateEnrichedBillUseCase(clientProvider, repository, referenceGenerator);

    const result = await useCase.execute({
      isNewClient: false,
      clientIdOrName: 'client-123',
      amountTTC: -1,
      dueDate: '2026-04-20',
      externalInvoiceReference: 'EXT-7788',
      type: 'Situation',
      paymentMode: 'Virement'
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('BILL_CREATION_ERROR');
    expect(result.error.message).toBe('Le montant TTC doit être supérieur ou égal à 0.');
    expect(repository.savedBill).toBeNull();
  });

  it("fails when due date is missing", async () => {
    const repository = new InMemoryBillRepository();
    const referenceGenerator = new StaticReferenceGenerator();
    const clientProvider = new SuccessClientProvider();
    const useCase = new CreateEnrichedBillUseCase(clientProvider, repository, referenceGenerator);

    const result = await useCase.execute({
      isNewClient: false,
      clientIdOrName: 'client-123',
      amountTTC: 100,
      dueDate: ' ',
      externalInvoiceReference: 'EXT-7788',
      type: 'Situation',
      paymentMode: 'Virement'
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('BILL_CREATION_ERROR');
    expect(result.error.message).toBe("La date d'échéance est obligatoire.");
    expect(repository.savedBill).toBeNull();
  });

  it('fails when external invoice reference is missing', async () => {
    const repository = new InMemoryBillRepository();
    const referenceGenerator = new StaticReferenceGenerator();
    const clientProvider = new SuccessClientProvider();
    const useCase = new CreateEnrichedBillUseCase(clientProvider, repository, referenceGenerator);

    const result = await useCase.execute({
      isNewClient: false,
      clientIdOrName: 'client-123',
      amountTTC: 100,
      dueDate: '2026-04-20',
      externalInvoiceReference: '',
      type: 'Situation',
      paymentMode: 'Virement'
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('BILL_CREATION_ERROR');
    expect(result.error.message).toBe('La référence facture externe est obligatoire.');
    expect(repository.savedBill).toBeNull();
  });

  it('fails when bill type is not coherent', async () => {
    const repository = new InMemoryBillRepository();
    const referenceGenerator = new StaticReferenceGenerator();
    const clientProvider = new SuccessClientProvider();
    const useCase = new CreateEnrichedBillUseCase(clientProvider, repository, referenceGenerator);

    const result = await useCase.execute({
      isNewClient: false,
      clientIdOrName: 'client-123',
      amountTTC: 100,
      dueDate: '2026-04-20',
      externalInvoiceReference: 'EXT-7788',
      type: 'InvalidType',
      paymentMode: 'Virement'
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }
    expect(result.error.message).toBe("Le type de facture est invalide. Valeurs autorisées: Situation, Solde, Acompte.");
  });

  it('fails when payment mode is not coherent', async () => {
    const repository = new InMemoryBillRepository();
    const referenceGenerator = new StaticReferenceGenerator();
    const clientProvider = new SuccessClientProvider();
    const useCase = new CreateEnrichedBillUseCase(clientProvider, repository, referenceGenerator);

    const result = await useCase.execute({
      isNewClient: false,
      clientIdOrName: 'client-123',
      amountTTC: 100,
      dueDate: '2026-04-20',
      externalInvoiceReference: 'EXT-7788',
      type: 'Situation',
      paymentMode: 'Carte'
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }
    expect(result.error.message).toBe('Le mode de paiement est invalide. Valeurs autorisées: Virement, Chèque, Espèces.');
  });
});
