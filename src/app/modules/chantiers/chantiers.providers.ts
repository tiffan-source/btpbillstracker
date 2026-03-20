import { Provider } from '@angular/core';
import { CreateChantierUseCase } from './domain/usecases/create-chantier.usecase';
import { ChantierRepository } from './domain/ports/chantier.repository';
import { LocalChantierRepository } from './infrastructure/local-chantier.repository';

export const CHANTIERS_PROVIDERS: Provider[] = [
  { provide: ChantierRepository, useClass: LocalChantierRepository },
  {
    provide: CreateChantierUseCase,
    useFactory: (repository: ChantierRepository) => new CreateChantierUseCase(repository),
    deps: [ChantierRepository]
  }
];

