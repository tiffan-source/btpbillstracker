import { Injectable } from '@angular/core';
import { ClientProviderPort, ResolveClientInput } from '../../domain/ports/client-provider.port';
import { QuickClientCreatorPort } from '../../../clients';
import { Result, success, failure } from '../../../../core/result/result';

@Injectable()
export class CrossModuleClientProviderAdapter implements ClientProviderPort {
  constructor(private readonly quickClientCreator: QuickClientCreatorPort) {}

  async resolveClient(input: ResolveClientInput): Promise<Result<string>> {
    if (!input.isNewClient) {
      return success(input.clientIdOrName);
    }

    const clientResult = await this.quickClientCreator.execute({
      name: input.clientIdOrName,
      email: input.clientEmail
    });

    if (!clientResult.success) {
      return failure(clientResult.error.code, clientResult.error.message);
    }

    return success(clientResult.data.id);
  }
}
