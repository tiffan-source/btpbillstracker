import { Provider } from '@angular/core';
import { ClientRepository } from './domain/ports/client.repository';
import { LocalClientRepository } from './infrastructure/local-client.repository';
import { FirestoreClientRepository } from './infrastructure/firestore-client.repository';
import { CreateQuickClientUseCase } from './domain/usecases/create-quick-client.usecase';
import { QuickClientCreatorPort } from './domain/ports/quick-client-creator.port';
import { ListClientsUseCase } from './domain/usecases/list-clients.usecase';
import { UpdateClientUseCase } from './domain/usecases/update-client.usecase';
import { environment } from '../../../environments/environment';
import { IdGeneratorPort } from '../../core/ids/id-generator.port';
import { UuidIdGeneratorService } from '../../core/ids/uuid-id-generator.service';

/**
 * Résoudre l'implémentation de repository clients selon le feature flag de persistance.
 */
export const resolveClientRepositoryClass = (useFirebasePersistence: boolean) =>
  useFirebasePersistence ? FirestoreClientRepository : LocalClientRepository;

export const CLIENT_PROVIDERS: Provider[] = [
  { provide: IdGeneratorPort, useClass: UuidIdGeneratorService },
  {
    provide: ClientRepository,
    useClass: resolveClientRepositoryClass(environment.useFirebasePersistence)
  },

  {
    provide: CreateQuickClientUseCase,
    useFactory: (repo: ClientRepository, idGenerator: IdGeneratorPort) =>
      new CreateQuickClientUseCase(repo, idGenerator),
    deps: [ClientRepository, IdGeneratorPort]
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
