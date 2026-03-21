import { failure, success } from '../../../../core/result/result';
import { GetCurrentUserUseCase } from '../../../auth/domain/usecases/get-current-user.usecase';
import { CrossModuleCurrentUserAdapter } from './cross-module-current-user.adapter';

describe('CrossModuleCurrentUserAdapter', () => {
  it('maps auth user to billing current user', async () => {
    const useCase = {
      execute: vi.fn().mockResolvedValue(success({ uid: 'u-1', email: 'a@b.c', emailVerified: true }))
    } as unknown as GetCurrentUserUseCase;
    const adapter = new CrossModuleCurrentUserAdapter(useCase);

    const result = await adapter.getCurrentUser();

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data?.uid).toBe('u-1');
  });

  it('propagates auth failure', async () => {
    const useCase = {
      execute: vi.fn().mockResolvedValue(failure('AUTH_PERSISTENCE_ERROR', 'ko'))
    } as unknown as GetCurrentUserUseCase;
    const adapter = new CrossModuleCurrentUserAdapter(useCase);

    const result = await adapter.getCurrentUser();

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('AUTH_PERSISTENCE_ERROR');
  });
});
