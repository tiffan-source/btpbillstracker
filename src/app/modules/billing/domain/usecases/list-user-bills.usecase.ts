import { Result, failure, success } from '../../../../core/result/result';
import { Bill } from '../entities/bill.entity';
import { BillPersistenceError } from '../errors/bill-persistence.error';
import { BillRepository } from '../ports/bill.repository';
import { CurrentUserPort } from '../ports/current-user.port';

/**
 * Lister les factures de l'utilisateur connecté.
 */
export class ListUserBillsUseCase {
  constructor(
    private readonly billRepository: BillRepository,
    private readonly currentUserPort: CurrentUserPort
  ) {}

  async execute(): Promise<Result<Bill[]>> {
    try {
      const userResult = await this.currentUserPort.getCurrentUser();

      if (!userResult.success) {
        return failure(userResult.error.code, userResult.error.message, userResult.error.metadata);
      }

      const user = userResult.data;
      if (!user?.uid) {
        return failure('AUTH_USER_NOT_FOUND', 'Utilisateur non authentifié.');
      }

      const bills = await this.billRepository.listByOwner(user.uid);
      return success(bills);
    } catch (error: unknown) {
      if (error instanceof BillPersistenceError) {
        return failure(error.code, error.message, error.metadata);
      }

      return failure('UNKNOWN_ERROR', 'Une erreur inattendue est survenue.');
    }
  }
}
