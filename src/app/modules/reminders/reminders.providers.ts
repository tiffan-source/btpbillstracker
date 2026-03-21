import { Provider } from '@angular/core';
import { ListReminderScenariosUseCase } from './domain/usecases/list-reminder-scenarios.usecase';
import { ReminderScenarioRepository } from './domain/ports/reminder-scenario.repository';
import { LocalReminderScenarioRepository } from './infrastructure/repositories/local-reminder-scenario.repository';
import { FirestoreReminderScenarioRepository } from './infrastructure/repositories/firestore-reminder-scenario.repository';
import { ReminderAssociationRepository } from './domain/ports/reminder-association.repository';
import { LocalReminderAssociationRepository } from './infrastructure/repositories/local-reminder-association.repository';
import { environment } from '../../../environments/environment';

/**
 * Résoudre l'implémentation des scénarios de relance selon le feature flag de persistance.
 */
export const resolveReminderScenarioRepositoryClass = (useFirebasePersistence: boolean) =>
  useFirebasePersistence ? FirestoreReminderScenarioRepository : LocalReminderScenarioRepository;

export const REMINDERS_PROVIDERS: Provider[] = [
  {
    provide: ReminderScenarioRepository,
    useClass: resolveReminderScenarioRepositoryClass(environment.useFirebasePersistence)
  },
  { provide: ReminderAssociationRepository, useClass: LocalReminderAssociationRepository },
  {
    provide: ListReminderScenariosUseCase,
    useFactory: (repository: ReminderScenarioRepository) => new ListReminderScenariosUseCase(repository),
    deps: [ReminderScenarioRepository]
  }
];
