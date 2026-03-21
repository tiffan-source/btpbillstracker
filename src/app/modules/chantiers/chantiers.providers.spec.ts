import { ChantierRepository } from './domain/ports/chantier.repository';
import { LocalChantierRepository } from './infrastructure/local-chantier.repository';
import { FirestoreChantierRepository } from './infrastructure/firestore-chantier.repository';
import { CHANTIERS_PROVIDERS, resolveChantierRepositoryClass } from './chantiers.providers';
import { TestBed } from '@angular/core/testing';

describe('CHANTIERS_PROVIDERS', () => {
  it('resolves Firestore repository class when flag is enabled', () => {
    expect(resolveChantierRepositoryClass(true)).toBe(FirestoreChantierRepository);
  });

  it('resolves Local repository class when flag is disabled', () => {
    expect(resolveChantierRepositoryClass(false)).toBe(LocalChantierRepository);
  });

  it('binds repository token using resolver and environment flag', () => {
    const binding = CHANTIERS_PROVIDERS.find((provider) => 'provide' in provider && provider.provide === ChantierRepository);
    expect(binding && 'useClass' in binding ? binding.useClass : null).toBe(resolveChantierRepositoryClass(false));
  });

  it('resolves Local implementation via DI when rollback flag is OFF', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: ChantierRepository, useClass: resolveChantierRepositoryClass(false) }]
    });

    const repository = TestBed.inject(ChantierRepository);
    expect(repository instanceof LocalChantierRepository).toBe(true);
  });

  it('resolves Firestore implementation via DI when flag is ON', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: ChantierRepository, useClass: resolveChantierRepositoryClass(true) }]
    });

    const repository = TestBed.inject(ChantierRepository);
    expect(repository instanceof FirestoreChantierRepository).toBe(true);
  });
});
