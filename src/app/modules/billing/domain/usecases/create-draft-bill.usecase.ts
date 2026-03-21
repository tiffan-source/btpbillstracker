import { Bill } from '../entities/bill.entity';
import { BillClientRequiredError } from '../errors/bill-client-required.error';
import { BillPersistenceError } from '../errors/bill-persistence.error';
import { InvalidBillReferenceError } from '../errors/invalid-bill-reference.error';
import { BillRepository } from '../ports/bill.repository';
import { ReferenceGeneratorService } from '../ports/reference-generator.service';
import { Result, success, failure } from '../../../../core/result/result';
import { IdGeneratorPort } from '../../../../core/ids/id-generator.port';

export class CreateDraftBillUseCase {
  constructor(
    private readonly repository: BillRepository,
    private readonly referenceGenerator: ReferenceGeneratorService,
    private readonly idGenerator: IdGeneratorPort
  ) {}

  async execute(clientId: string): Promise<Result<Bill>> {
    try {
      const reference = await this.referenceGenerator.generate();
      const id = this.idGenerator.generate();
      const bill = new Bill(id, reference, clientId);

      await this.repository.save(bill);

      return success(bill);
    } catch (error: unknown) {
      if (
        error instanceof InvalidBillReferenceError ||
        error instanceof BillClientRequiredError ||
        error instanceof BillPersistenceError
      ) {
        return failure(error.code, error.message, error.metadata);
      }

      const message = error instanceof Error ? error.message : 'Error occurred while creating the bill';
      return failure('UNKNOWN_ERROR', message);
    }
  }
}
