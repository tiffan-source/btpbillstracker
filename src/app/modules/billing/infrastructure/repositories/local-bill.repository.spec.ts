import { Bill } from '../../domain/entities/bill.entity';
import { BillPersistenceError } from '../../domain/errors/bill-persistence.error';
import { LocalBillRepository } from './local-bill.repository';

describe('LocalBillRepository', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should save a bill in local storage', async () => {
    const repository = new LocalBillRepository();
    const bill = new Bill('b-1', 'F-2026-0001', 'c-1');

    await repository.save(bill);

    const raw = localStorage.getItem('btp_bills');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw ?? '[]')).toHaveLength(1);
  });

  it('should map storage technical failures to BillPersistenceError', async () => {
    const repository = new LocalBillRepository();
    const bill = new Bill('b-2', 'F-2026-0002', 'c-2');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    await expect(repository.save(bill)).rejects.toThrow(BillPersistenceError);

    setItemSpy.mockRestore();
  });

  it('should list saved bills from local storage', async () => {
    const repository = new LocalBillRepository();
    const bill = new Bill('b-3', 'F-2026-0003', 'c-3');

    await repository.save(bill);
    const bills = await repository.list();

    expect(bills).toHaveLength(1);
    expect(bills[0]?.id).toBe('b-3');
    expect(bills[0]?.reference).toBe('F-2026-0003');
    expect(bills[0]?.clientId).toBe('c-3');
  });
});
