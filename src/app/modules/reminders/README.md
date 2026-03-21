# Reminders Module

## 📍 Role (What)
Manage reminder scenarios that can be associated to invoices during creation.

## 📦 Key Content (Inside)
- Main entity: `ReminderScenario`.
- Use case: `ListReminderScenariosUseCase` (returns `Result<ReminderScenario[]>`).
- Infrastructure repositories: `LocalReminderScenarioRepository`, `FirestoreReminderScenarioRepository`.

## ⚠️ Specific Constraints
- No implicit runtime seeding is allowed for reminder scenarios.
- Scenario steps are normalized and must remain unique.
