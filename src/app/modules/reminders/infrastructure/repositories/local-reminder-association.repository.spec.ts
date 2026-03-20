import { ReminderAssociation } from '../../domain/entities/reminder-association.entity';
import { ReminderPersistenceError } from '../../domain/errors/reminder-persistence.error';
import { LocalReminderAssociationRepository } from './local-reminder-association.repository';

describe('LocalReminderAssociationRepository', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves bill reminder association by bill id', async () => {
    const repository = new LocalReminderAssociationRepository();
    const association = new ReminderAssociation('bill-1', 'standard-reminder-scenario');

    await repository.save(association);

    const found = await repository.findByBillId('bill-1');
    expect(found).toBeTruthy();
    expect(found?.billId).toBe('bill-1');
    expect(found?.reminderScenarioId).toBe('standard-reminder-scenario');
  });

  it('returns null when no association exists for bill id', async () => {
    const repository = new LocalReminderAssociationRepository();

    const found = await repository.findByBillId('bill-missing');

    expect(found).toBeNull();
  });

  it('maps technical storage failures to ReminderPersistenceError on association save', async () => {
    const repository = new LocalReminderAssociationRepository();
    const association = new ReminderAssociation('bill-2', 'standard-reminder-scenario');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    await expect(repository.save(association)).rejects.toThrow(ReminderPersistenceError);

    setItemSpy.mockRestore();
  });
});
