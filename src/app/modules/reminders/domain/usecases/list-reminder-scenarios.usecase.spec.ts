import { ReminderScenario } from '../entities/reminder-scenario.entity';
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

    const scenarios = await useCase.execute();

    expect(
      scenarios.map((scenario) => ({
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
});
