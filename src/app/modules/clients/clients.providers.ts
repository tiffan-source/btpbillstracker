import { Provider } from '@angular/core';
import { ClientRepository } from './domain/ports/client.repository';
import { LocalClientRepository } from './infrastructure/local-client.repository';
import { CreateQuickClientUseCase } from './domain/usecases/create-quick-client.usecase';

export const CLIENT_PROVIDERS: Provider[] = [
  { provide: ClientRepository, useClass: LocalClientRepository },

  {
    provide: CreateQuickClientUseCase,
    useFactory: (repo: ClientRepository) => new CreateQuickClientUseCase(repo),
    deps: [ClientRepository]
  }
];
