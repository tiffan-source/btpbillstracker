import { TestBed } from '@angular/core/testing';
import { BillRepository } from './domain/ports/bill.repository';
import { BILLING_PROVIDERS, resolveBillRepositoryClass } from './billing.providers';
import { FirestoreBillRepository } from './infrastructure/repositories/firestore-bill.repository';
import { CurrentUserPort } from './domain/ports/current-user.port';
import { ListUserBillsUseCase } from './domain/usecases/list-user-bills.usecase';
import { LocalBillRepository } from './infrastructure/repositories/local-bill.repository';

describe('BILLING_PROVIDERS', () => {
  it('resolves Firestore repository class when flag is enabled', () => {
    expect(resolveBillRepositoryClass(true)).toBe(FirestoreBillRepository);
  });

  it('resolves Local repository class when flag is disabled', () => {
    expect(resolveBillRepositoryClass(false)).toBe(LocalBillRepository);
  });

  it('binds repository token using resolver and environment flag', () => {
    const binding = BILLING_PROVIDERS.find((provider) => 'provide' in provider && provider.provide === BillRepository);
    expect(binding && 'useClass' in binding ? binding.useClass : null).toBe(resolveBillRepositoryClass(false));
  });

  it('resolves Local implementation via DI when rollback flag is OFF', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: BillRepository, useClass: resolveBillRepositoryClass(false) }]
    });

    const repository = TestBed.inject(BillRepository);
    expect(repository instanceof LocalBillRepository).toBe(true);
  });

  it('registers ListUserBillsUseCase factory dependencies', () => {
    const binding = BILLING_PROVIDERS.find((provider) => 'provide' in provider && provider.provide === ListUserBillsUseCase);
    expect(binding && 'deps' in binding ? binding.deps : null).toEqual([BillRepository, CurrentUserPort]);
  });

  it('resolves Firestore implementation via DI when flag is ON', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: BillRepository, useClass: resolveBillRepositoryClass(true) }]
    });

    const repository = TestBed.inject(BillRepository);
    expect(repository instanceof FirestoreBillRepository).toBe(true);
  });
});
