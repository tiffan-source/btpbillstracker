import { Provider } from '@angular/core';
import { ClientRepository } from './domain/ports/client.repository';
import { LocalClientRepository } from './infrastructure/local-client.repository';
import { CreateQuickClientUseCase } from './domain/usecases/create-quick-client.usecase';
import { QuickClientCreatorPort } from './domain/ports/quick-client-creator.port';
import { ListClientsUseCase } from './domain/usecases/list-clients.usecase';
import { UpdateClientUseCase } from './domain/usecases/update-client.usecase';

export const CLIENT_PROVIDERS: Provider[] = [
  { provide: ClientRepository, useClass: LocalClientRepository },

  {
    provide: CreateQuickClientUseCase,
    useFactory: (repo: ClientRepository) => new CreateQuickClientUseCase(repo),
    deps: [ClientRepository]
  },
  {
    provide: ListClientsUseCase,
    useFactory: (repo: ClientRepository) => new ListClientsUseCase(repo),
    deps: [ClientRepository]
  },
  {
    provide: UpdateClientUseCase,
    useFactory: (repo: ClientRepository) => new UpdateClientUseCase(repo),
    deps: [ClientRepository]
  },
  {
    provide: QuickClientCreatorPort,
    useExisting: CreateQuickClientUseCase
  }
];
