import { ReminderScenario } from '../entities/reminder-scenario.entity';
import { ReminderScenarioRepository } from '../ports/reminder-scenario.repository';
import { EnsureStandardReminderScenarioUseCase } from './ensure-standard-reminder-scenario.usecase';

describe('EnsureStandardReminderScenarioUseCase', () => {
  class InMemoryRepository extends ReminderScenarioRepository {
    private scenarios: ReminderScenario[] = [];

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

  it('seeds the standard scenario when missing', async () => {
    const repository = new InMemoryRepository();
    const useCase = new EnsureStandardReminderScenarioUseCase(repository);

    await useCase.execute();

    const scenarios = await repository.list();
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

  it('does not duplicate the standard scenario when already present', async () => {
    const repository = new InMemoryRepository();
    const useCase = new EnsureStandardReminderScenarioUseCase(repository);

    await useCase.execute();
    await useCase.execute();

    const scenarios = await repository.list();
    expect(scenarios).toHaveLength(1);
  });
});
