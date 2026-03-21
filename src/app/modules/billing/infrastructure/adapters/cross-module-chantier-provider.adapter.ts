import { Injectable } from '@angular/core';
import { QuickChantierCreatorPort } from '../../../chantiers';
import { failure, Result, success } from '../../../../core/result/result';
import { ResolveChantierIdInput, ResolveChantierIdPort } from '../../domain/ports/resolve-chantier-id.port';
import { ChantierResolutionError } from '../../domain/errors/chantier-resolution-error';

@Injectable()
export class CrossModuleChantierProviderAdapter implements ResolveChantierIdPort {
  constructor(private readonly quickChantierCreator: QuickChantierCreatorPort) {}

  async execute(input: ResolveChantierIdInput): Promise<Result<string>> {
    try {
      const chantierResult = await this.quickChantierCreator.execute({ name: input.chantierName });
      if (!chantierResult.success) {
        return failure(chantierResult.error.code, chantierResult.error.message, chantierResult.error.metadata);
      }
      return success(chantierResult.data.id);
    } catch (error: unknown) {
      const mapped = new ChantierResolutionError(undefined, { provider: 'QuickChantierCreatorPort' }, error);
      return failure(mapped.code, mapped.message, mapped.metadata);
    }
  }
}
