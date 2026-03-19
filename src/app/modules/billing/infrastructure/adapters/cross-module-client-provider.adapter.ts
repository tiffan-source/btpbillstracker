import { Injectable } from '@angular/core';
import { ClientProviderPort, ResolveClientInput } from '../../domain/ports/client-provider.port';
import { CreateQuickClientUseCase } from '../../../clients';
import { Result, success, failure } from '../../../../core/result/result';

@Injectable()
export class CrossModuleClientProviderAdapter implements ClientProviderPort {
  constructor(private readonly createQuickClientUseCase: CreateQuickClientUseCase) {}

  async resolveClient(input: ResolveClientInput): Promise<Result<string>> {
    if (!input.isNewClient) {
      return success(input.clientIdOrName);
    }

    const clientResult = await this.createQuickClientUseCase.execute({
      name: input.clientIdOrName,
      email: input.clientEmail
    });

    if (!clientResult.success) {
      return failure(clientResult.error.code, clientResult.error.message);
    }

    return success(clientResult.data.id);
  }
}
