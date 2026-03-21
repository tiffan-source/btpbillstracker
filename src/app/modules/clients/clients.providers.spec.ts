import { ClientRepository } from './domain/ports/client.repository';
import { LocalClientRepository } from './infrastructure/local-client.repository';
import { FirestoreClientRepository } from './infrastructure/firestore-client.repository';
import { CLIENT_PROVIDERS, resolveClientRepositoryClass } from './clients.providers';
import { TestBed } from '@angular/core/testing';

describe('CLIENT_PROVIDERS', () => {
  it('resolves Firestore repository class when flag is enabled', () => {
    expect(resolveClientRepositoryClass(true)).toBe(FirestoreClientRepository);
  });

  it('resolves Local repository class when flag is disabled', () => {
    expect(resolveClientRepositoryClass(false)).toBe(LocalClientRepository);
  });

  it('binds repository token using resolver and environment flag', () => {
    const binding = CLIENT_PROVIDERS.find((provider) => 'provide' in provider && provider.provide === ClientRepository);
    expect(binding && 'useClass' in binding ? binding.useClass : null).toBe(resolveClientRepositoryClass(false));
  });

  it('resolves Local implementation via DI when rollback flag is OFF', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: ClientRepository, useClass: resolveClientRepositoryClass(false) }]
    });

    const repository = TestBed.inject(ClientRepository);
    expect(repository instanceof LocalClientRepository).toBe(true);
  });

  it('resolves Firestore implementation via DI when flag is ON', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: ClientRepository, useClass: resolveClientRepositoryClass(true) }]
    });

    const repository = TestBed.inject(ClientRepository);
    expect(repository instanceof FirestoreClientRepository).toBe(true);
  });
});
