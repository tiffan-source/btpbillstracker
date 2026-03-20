import { Provider } from '@angular/core';
import { BillRepository } from './domain/ports/bill.repository';
import { LocalBillRepository } from './infrastructure/repositories/local-bill.repository';
import { ReferenceGeneratorService } from './domain/ports/reference-generator.service';
import { SimpleReferenceGenerator } from './infrastructure/simple-reference-generator.service';
import { BillStore } from './presentation/stores/bill.store';
import { LocalBillStore } from './infrastructure/stores/local-bill.store';
import { CreateEnrichedBillUseCase } from './domain/usecases/create-enriched-bill.usecase';
import { ClientProviderPort } from './domain/ports/client-provider.port';
import { CrossModuleClientProviderAdapter } from './infrastructure/adapters/cross-module-client-provider.adapter';

export const BILLING_PROVIDERS: Provider[] = [
  { provide: BillRepository, useClass: LocalBillRepository },
  { provide: ReferenceGeneratorService, useClass: SimpleReferenceGenerator },
  { provide: BillStore, useClass: LocalBillStore },
  { provide: ClientProviderPort, useClass: CrossModuleClientProviderAdapter },

  // Use cases are just pure TS classes, we can provide them as injectables manually or decorateur them
  // The Clean Arch spec states: "Le Use Case ne doit jamais utiliser le décorateur @Injectable()."
  // So we provide it here explicitly configuring its deps.
  {
    provide: CreateEnrichedBillUseCase,
    useFactory: (
      clientProvider: ClientProviderPort,
      repository: BillRepository,
      generator: ReferenceGeneratorService
    ) => new CreateEnrichedBillUseCase(clientProvider, repository, generator),
    deps: [ClientProviderPort, BillRepository, ReferenceGeneratorService]
  }
];
