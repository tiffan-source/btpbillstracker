import { Injectable } from '@angular/core';
import { GetCurrentUserUseCase } from '../../../auth/domain/usecases/get-current-user.usecase';
import { Result, failure, success } from '../../../../core/result/result';
import { BillingCurrentUser, CurrentUserPort } from '../../domain/ports/current-user.port';

@Injectable()
export class CrossModuleCurrentUserAdapter implements CurrentUserPort {
  constructor(private readonly getCurrentUserUseCase: GetCurrentUserUseCase) {}

  async getCurrentUser(): Promise<Result<BillingCurrentUser | null>> {
    const result = await this.getCurrentUserUseCase.execute();

    if (!result.success) {
      return failure(result.error.code, result.error.message, result.error.metadata);
    }

    return success(result.data ? { uid: result.data.uid } : null);
  }
}
