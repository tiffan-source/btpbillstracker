import { ReminderScenario } from '../entities/reminder-scenario.entity';
import { ReminderPersistenceError } from '../errors/reminder-persistence.error';
import { ReminderScenarioRepository } from '../ports/reminder-scenario.repository';
import { ListReminderScenariosUseCase } from './list-reminder-scenarios.usecase';

describe('ListReminderScenariosUseCase', () => {
  class InMemoryRepository extends ReminderScenarioRepository {
    constructor(private readonly scenarios: ReminderScenario[]) {
      super();
    }

    async findByName(name: string): Promise<ReminderScenario | null> {
      return this.scenarios.find((scenario) => scenario.name === name) ?? null;
    }

    async save(scenario: ReminderScenario): Promise<void> {
      this.scenarios.push(scenario);
    }

    async list(): Promise<ReminderScenario[]> {
      return this.scenarios;
    }
  }

  it('returns available reminder scenarios', async () => {
    const repository = new InMemoryRepository([
      new ReminderScenario('standard-reminder-scenario', 'Standard – J-3, J+3, J+10', [-3, 3, 10])
    ]);
    const useCase = new ListReminderScenariosUseCase(repository);

    const result = await useCase.execute();
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(
      result.data.map((scenario) => ({
        id: scenario.id,
        name: scenario.name,
        steps: scenario.steps
      }))
    ).toEqual([
      {
        id: 'standard-reminder-scenario',
        name: 'Standard – J-3, J+3, J+10',
        steps: [-3, 3, 10]
      }
    ]);
  });

  it('maps persistence errors into a failure result', async () => {
    class FailingRepository extends ReminderScenarioRepository {
      async findByName(): Promise<ReminderScenario | null> {
        return null;
      }
      async save(): Promise<void> {
        return;
      }
      async list(): Promise<ReminderScenario[]> {
        throw new ReminderPersistenceError('Repository indisponible.');
      }
    }

    const useCase = new ListReminderScenariosUseCase(new FailingRepository());

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }
    expect(result.error.code).toBe('REMINDER_PERSISTENCE_ERROR');
    expect(result.error.message).toBe('Repository indisponible.');
  });
});
