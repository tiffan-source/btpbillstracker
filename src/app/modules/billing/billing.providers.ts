import { Provider } from '@angular/core';
import { BillRepository } from './domain/ports/bill.repository';
import { LocalBillRepository } from './infrastructure/repositories/local-bill.repository';
import { FirestoreBillRepository } from './infrastructure/repositories/firestore-bill.repository';
import { ReferenceGeneratorService } from './domain/ports/reference-generator.service';
import { SimpleReferenceGenerator } from './infrastructure/simple-reference-generator.service';
import { BillStore } from './presentation/stores/bill.store';
import { LocalBillStore } from './infrastructure/stores/local-bill.store';
import { CreateEnrichedBillUseCase } from './domain/usecases/create-enriched-bill.usecase';
import { UpdateEnrichedBillUseCase } from './domain/usecases/update-enriched-bill.usecase';
import { ClientProviderPort } from './domain/ports/client-provider.port';
import { CrossModuleClientProviderAdapter } from './infrastructure/adapters/cross-module-client-provider.adapter';
import { ReminderAssociationRepository } from '../reminders/domain/ports/reminder-association.repository';
import { CurrentUserPort } from './domain/ports/current-user.port';
import { ListUserBillsUseCase } from './domain/usecases/list-user-bills.usecase';
import { CrossModuleCurrentUserAdapter } from './infrastructure/adapters/cross-module-current-user.adapter';
import { LocalReminderAssociationRepository } from '../reminders/infrastructure/repositories/local-reminder-association.repository';
import { environment } from '../../../environments/environment';
import { GetCurrentUserUseCase } from '../auth/domain/usecases/get-current-user.usecase';
import { IdGeneratorPort } from '../../core/ids/id-generator.port';
import { UuidIdGeneratorService } from '../../core/ids/uuid-id-generator.service';
import { ResolveChantierIdPort } from './domain/ports/resolve-chantier-id.port';
import { CrossModuleChantierProviderAdapter } from './infrastructure/adapters/cross-module-chantier-provider.adapter';

/**
 * Résoudre l'implémentation de repository billing selon le feature flag de persistance.
 */
export const resolveBillRepositoryClass = (useFirebasePersistence: boolean) =>
  useFirebasePersistence ? FirestoreBillRepository : LocalBillRepository;

export const BILLING_PROVIDERS: Provider[] = [
  { provide: IdGeneratorPort, useClass: UuidIdGeneratorService },
  { provide: BillRepository, useClass: resolveBillRepositoryClass(environment.useFirebasePersistence) },
  { provide: ReferenceGeneratorService, useClass: SimpleReferenceGenerator },
  { provide: BillStore, useClass: LocalBillStore },
  { provide: ClientProviderPort, useClass: CrossModuleClientProviderAdapter },
  { provide: ReminderAssociationRepository, useClass: LocalReminderAssociationRepository },
  { provide: CurrentUserPort, useClass: CrossModuleCurrentUserAdapter },
  { provide: ResolveChantierIdPort, useClass: CrossModuleChantierProviderAdapter },

  // Use cases are just pure TS classes, we can provide them as injectables manually or decorateur them
  // The Clean Arch spec states: "Le Use Case ne doit jamais utiliser le décorateur @Injectable()."
  // So we provide it here explicitly configuring its deps.
  {
    provide: CreateEnrichedBillUseCase,
    useFactory: (
      clientProvider: ClientProviderPort,
      repository: BillRepository,
      generator: ReferenceGeneratorService,
      idGenerator: IdGeneratorPort,
      chantierResolver: ResolveChantierIdPort
    ) => new CreateEnrichedBillUseCase(clientProvider, repository, generator, idGenerator, chantierResolver),
    deps: [ClientProviderPort, BillRepository, ReferenceGeneratorService, IdGeneratorPort, ResolveChantierIdPort]
  },
  {
    provide: ListUserBillsUseCase,
    useFactory: (repository: BillRepository, currentUserPort: CurrentUserPort) =>
      new ListUserBillsUseCase(repository, currentUserPort),
    deps: [BillRepository, CurrentUserPort]
  },
  {
    provide: UpdateEnrichedBillUseCase,
    useFactory: (repository: BillRepository) => new UpdateEnrichedBillUseCase(repository),
    deps: [BillRepository]
  }
];
