import { ReminderScenario } from '../../domain/entities/reminder-scenario.entity';
import { ReminderPersistenceError } from '../../domain/errors/reminder-persistence.error';
import { LocalReminderScenarioRepository } from './local-reminder-scenario.repository';

describe('LocalReminderScenarioRepository', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('saves and lists reminder scenarios from local storage', async () => {
    const repository = new LocalReminderScenarioRepository();
    const scenario = new ReminderScenario('standard-reminder-scenario', 'Standard – J-3, J+3, J+10', [-3, 3, 10]);

    await repository.save(scenario);

    const listed = await repository.list();
    expect(
      listed.map((item) => ({ id: item.id, name: item.name, steps: item.steps }))
    ).toEqual([
      { id: 'standard-reminder-scenario', name: 'Standard – J-3, J+3, J+10', steps: [-3, 3, 10] }
    ]);
  });

  it('returns an empty list when storage has no scenarios', async () => {
    const repository = new LocalReminderScenarioRepository();

    const listed = await repository.list();

    expect(listed).toEqual([]);
  });

  it('maps technical storage failures to ReminderPersistenceError on save', async () => {
    const repository = new LocalReminderScenarioRepository();
    const scenario = new ReminderScenario('standard-reminder-scenario', 'Standard – J-3, J+3, J+10', [-3, 3, 10]);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    await expect(repository.save(scenario)).rejects.toThrow(ReminderPersistenceError);

    setItemSpy.mockRestore();
  });
});
