import { Injectable } from '@angular/core';
import { ClientProviderPort, ResolveClientInput } from '../../domain/ports/client-provider.port';
import { QuickClientCreatorPort } from '../../../clients';
import { Result, success, failure } from '../../../../core/result/result';
import { ClientResolutionError } from '../../domain/errors/client-resolution-error';

@Injectable()
export class CrossModuleClientProviderAdapter implements ClientProviderPort {
  constructor(private readonly quickClientCreator: QuickClientCreatorPort) {}

  async resolveClient(input: ResolveClientInput): Promise<Result<string>> {
    if (!input.isNewClient) {
      return success(input.clientIdOrName);
    }

    try {
      const clientResult = await this.quickClientCreator.execute({
        firstName: input.clientIdOrName,
        lastName: 'Client',
        email: input.clientEmail
      });

      if (!clientResult.success) {
        return failure(clientResult.error.code, clientResult.error.message);
      }

      return success(clientResult.data.id);
    } catch (error: unknown) {
      const mapped = new ClientResolutionError(undefined, { provider: 'QuickClientCreatorPort' }, error);
      return failure(mapped.code, mapped.message, mapped.metadata);
    }
  }
}
