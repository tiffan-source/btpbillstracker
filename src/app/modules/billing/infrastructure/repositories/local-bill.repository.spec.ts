import { Bill } from '../../domain/entities/bill.entity';
import { BillNotFoundError } from '../../domain/errors/bill-not-found.error';
import { BillPersistenceError } from '../../domain/errors/bill-persistence.error';
import { LocalBillDataSource } from './local-bill.datasource';
import { LocalBillRepository } from './local-bill.repository';

describe('LocalBillRepository', () => {
  const createDataSource = (uid: string | null): LocalBillDataSource =>
    ({
      getCurrentUser: vi.fn().mockReturnValue(uid ? { uid } : null)
    }) as unknown as LocalBillDataSource;

  afterEach(() => {
    localStorage.clear();
  });

  it('should save a bill in local storage', async () => {
    const repository = new LocalBillRepository(createDataSource('owner-1'));
    const bill = new Bill('b-1', 'F-2026-0001', 'c-1');

    await repository.save(bill);

    const raw = localStorage.getItem('btp_bills');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw ?? '[]')).toEqual([
      expect.objectContaining({ id: 'b-1', ownerUid: 'owner-1' })
    ]);
  });

  it('should map storage technical failures to BillPersistenceError', async () => {
    const repository = new LocalBillRepository(createDataSource('owner-1'));
    const bill = new Bill('b-2', 'F-2026-0002', 'c-2');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    await expect(repository.save(bill)).rejects.toThrow(BillPersistenceError);

    setItemSpy.mockRestore();
  });

  it('should list saved bills from local storage for current owner only', async () => {
    const repository = new LocalBillRepository(createDataSource('owner-1'));
    const bill = new Bill('b-3', 'F-2026-0003', 'c-3');

    await repository.save(bill);
    localStorage.setItem(
      'btp_bills',
      JSON.stringify([
        ...(JSON.parse(localStorage.getItem('btp_bills') ?? '[]') as unknown[]),
        { id: 'legacy', reference: 'F-LEG', clientId: 'c-x', status: 'DRAFT' },
        { id: 'other', ownerUid: 'owner-2', reference: 'F-OTH', clientId: 'c-y', status: 'DRAFT' }
      ])
    );
    const bills = await repository.list();

    expect(bills).toHaveLength(1);
    expect(bills[0]?.id).toBe('b-3');
    expect(bills[0]?.reference).toBe('F-2026-0003');
    expect(bills[0]?.clientId).toBe('c-3');
  });

  it('should update an existing persisted bill', async () => {
    const repository = new LocalBillRepository(createDataSource('owner-1'));
    const original = new Bill('b-4', 'F-2026-0004', 'c-4')
      .setAmountTTC(100)
      .setDueDate('2026-04-10')
      .setExternalInvoiceReference('EXT-4')
      .setType('Situation')
      .setPaymentMode('Virement')
      .setStatus('VALIDATED');

    await repository.save(original);

    const updated = new Bill('b-4', 'F-2026-0004', 'c-4')
      .setAmountTTC(250)
      .setDueDate('2026-04-15')
      .setExternalInvoiceReference('EXT-4B')
      .setType('Solde')
      .setPaymentMode('Chèque')
      .setChantierId('chantier-44')
      .setStatus('PAID');

    await repository.update(updated);

    const bills = await repository.listByOwner('owner-1');
    expect(bills).toHaveLength(1);
    expect(bills[0]?.amountTTC).toBe(250);
    expect(bills[0]?.externalInvoiceReference).toBe('EXT-4B');
    expect(bills[0]?.type).toBe('Solde');
    expect(bills[0]?.paymentMode).toBe('Chèque');
    expect(bills[0]?.chantierId).toBe('chantier-44');
    expect(bills[0]?.status).toBe('PAID');
  });

  it('should throw BillNotFoundError when updating a missing bill', async () => {
    const repository = new LocalBillRepository(createDataSource('owner-1'));
    const bill = new Bill('missing', 'F-2026-0099', 'c-9');

    await expect(repository.update(bill)).rejects.toThrow(BillNotFoundError);
  });

  it('throws BillPersistenceError when unauthenticated for save/list/update', async () => {
    const repository = new LocalBillRepository(createDataSource(null));
    const bill = new Bill('b-auth', 'F-2026-1111', 'c-1');

    await expect(repository.save(bill)).rejects.toThrow(BillPersistenceError);
    await expect(repository.list()).rejects.toThrow(BillPersistenceError);
    await expect(repository.update(bill)).rejects.toThrow(BillPersistenceError);
  });
});
