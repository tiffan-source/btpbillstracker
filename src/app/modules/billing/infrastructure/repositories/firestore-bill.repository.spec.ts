import { Bill } from '../../domain/entities/bill.entity';
import { BillNotFoundError } from '../../domain/errors/bill-not-found.error';
import { BillPersistenceError } from '../../domain/errors/bill-persistence.error';
import { FirestoreBillDataSource } from './firestore-bill.datasource';
import { FirestoreBillRepository } from './firestore-bill.repository';

describe('FirestoreBillRepository', () => {
  const createDataSource = (): FirestoreBillDataSource =>
    ({
      saveById: vi.fn(),
      readAll: vi.fn(),
      readById: vi.fn(),
      getCurrentUser: vi.fn().mockReturnValue({ uid: 'owner-1' }),
      getCollection: vi.fn(),
      getBillDocRef: vi.fn()
    }) as unknown as FirestoreBillDataSource;

  it('saves a bill with ownerUid', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.saveById).mockResolvedValue(undefined);
    const repository = new FirestoreBillRepository(dataSource);
    const bill = new Bill('b-1', 'F-2026-0001', 'c-1');

    await repository.save(bill);

    expect(dataSource.saveById).toHaveBeenCalledWith('b-1', {
      id: 'b-1',
      ownerUid: 'owner-1',
      reference: 'F-2026-0001',
      clientId: 'c-1',
      status: 'DRAFT',
      amountTTC: undefined,
      dueDate: undefined,
      externalInvoiceReference: undefined,
      type: undefined,
      paymentMode: undefined,
      chantier: undefined
    });
  });

  it('lists only bills scoped to requested owner', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readAll).mockResolvedValue({
      docs: [
        {
          data: () => ({
            id: 'b-1',
            ownerUid: 'owner-1',
            reference: 'F-2026-0001',
            clientId: 'c-1',
            status: 'VALIDATED'
          })
        },
        {
          data: () => ({
            id: 'b-2',
            ownerUid: 'owner-2',
            reference: 'F-2026-0002',
            clientId: 'c-2',
            status: 'DRAFT'
          })
        },
        {
          data: () => ({
            id: 'b-3',
            reference: 'F-2026-0003',
            clientId: 'c-3',
            status: 'DRAFT'
          })
        }
      ]
    } as never);
    const repository = new FirestoreBillRepository(dataSource);

    const bills = await repository.listByOwner('owner-1');

    expect(bills).toHaveLength(1);
    expect(bills[0]?.id).toBe('b-1');
  });

  it('rejects cross-owner update as not found', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readById).mockResolvedValue({
      exists: () => true,
      data: () => ({
        id: 'b-1',
        ownerUid: 'owner-2',
        reference: 'F-2026-0001',
        clientId: 'c-1',
        status: 'DRAFT'
      })
    } as never);
    const repository = new FirestoreBillRepository(dataSource);
    const bill = new Bill('b-1', 'F-2026-0001', 'c-1');

    await expect(repository.update(bill)).rejects.toThrow(BillNotFoundError);
  });

  it('maps datasource failures to BillPersistenceError', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readAll).mockRejectedValue(new Error('permission denied'));
    const repository = new FirestoreBillRepository(dataSource);

    await expect(repository.listByOwner('owner-1')).rejects.toThrow(BillPersistenceError);
  });
});
