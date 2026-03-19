import { Bill } from '../entities/bill.entity';
import { BillRepository } from '../ports/bill.repository';
import { ReferenceGeneratorService } from '../ports/reference-generator.service';
import { Result, success, failure } from '../../../../core/result/result';

export class CreateDraftBillUseCase {
  constructor(
    private readonly repository: BillRepository,
    private readonly referenceGenerator: ReferenceGeneratorService
  ) {}

  async execute(clientId: string): Promise<Result<Bill>> {
    try {
      const reference = await this.referenceGenerator.generate();
      const id = crypto.randomUUID();
      const bill = new Bill(id, reference, clientId);

      await this.repository.save(bill);

      return success(bill);
    } catch (e: any) {
      return failure('BILL_CREATION_ERROR', e.message || 'Error occurred while creating the bill');
    }
  }
}
