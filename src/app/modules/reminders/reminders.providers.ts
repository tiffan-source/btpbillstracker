import { APP_INITIALIZER, Provider } from '@angular/core';
import { EnsureStandardReminderScenarioUseCase } from './domain/usecases/ensure-standard-reminder-scenario.usecase';
import { ListReminderScenariosUseCase } from './domain/usecases/list-reminder-scenarios.usecase';
import { ReminderScenarioRepository } from './domain/ports/reminder-scenario.repository';
import { LocalReminderScenarioRepository } from './infrastructure/repositories/local-reminder-scenario.repository';
import { ReminderAssociationRepository } from './domain/ports/reminder-association.repository';
import { LocalReminderAssociationRepository } from './infrastructure/repositories/local-reminder-association.repository';

export const REMINDERS_PROVIDERS: Provider[] = [
  { provide: ReminderScenarioRepository, useClass: LocalReminderScenarioRepository },
  { provide: ReminderAssociationRepository, useClass: LocalReminderAssociationRepository },
  {
    provide: EnsureStandardReminderScenarioUseCase,
    useFactory: (repository: ReminderScenarioRepository) => new EnsureStandardReminderScenarioUseCase(repository),
    deps: [ReminderScenarioRepository]
  },
  {
    provide: ListReminderScenariosUseCase,
    useFactory: (repository: ReminderScenarioRepository) => new ListReminderScenariosUseCase(repository),
    deps: [ReminderScenarioRepository]
  },
  {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: (useCase: EnsureStandardReminderScenarioUseCase) => () => useCase.execute(),
    deps: [EnsureStandardReminderScenarioUseCase]
  }
];
