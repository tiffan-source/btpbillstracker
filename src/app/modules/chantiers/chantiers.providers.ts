import { Provider } from '@angular/core';
import { CreateChantierUseCase } from './domain/usecases/create-chantier.usecase';
import { ChantierRepository } from './domain/ports/chantier.repository';
import { LocalChantierRepository } from './infrastructure/local-chantier.repository';
import { FirestoreChantierRepository } from './infrastructure/firestore-chantier.repository';
import { ListChantiersUseCase } from './domain/usecases/list-chantiers.usecase';
import { UpdateChantierUseCase } from './domain/usecases/update-chantier.usecase';
import { environment } from '../../../environments/environment';
import { IdGeneratorPort } from '../../core/ids/id-generator.port';
import { UuidIdGeneratorService } from '../../core/ids/uuid-id-generator.service';

/**
 * Résoudre l'implémentation de repository chantiers selon le feature flag de persistance.
 */
export const resolveChantierRepositoryClass = (useFirebasePersistence: boolean) =>
  useFirebasePersistence ? FirestoreChantierRepository : LocalChantierRepository;

export const CHANTIERS_PROVIDERS: Provider[] = [
  { provide: IdGeneratorPort, useClass: UuidIdGeneratorService },
  {
    provide: ChantierRepository,
    useClass: resolveChantierRepositoryClass(environment.useFirebasePersistence)
  },
  {
    provide: CreateChantierUseCase,
    useFactory: (repository: ChantierRepository, idGenerator: IdGeneratorPort) =>
      new CreateChantierUseCase(repository, idGenerator),
    deps: [ChantierRepository, IdGeneratorPort]
  },
  {
    provide: ListChantiersUseCase,
    useFactory: (repository: ChantierRepository) => new ListChantiersUseCase(repository),
    deps: [ChantierRepository]
  },
  {
    provide: UpdateChantierUseCase,
    useFactory: (repository: ChantierRepository) => new UpdateChantierUseCase(repository),
    deps: [ChantierRepository]
  }
];
