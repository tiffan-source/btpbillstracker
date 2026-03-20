# Reminders Module

## 📍 Role (What)
Manage reminder scenarios that can be associated to invoices during creation.

## 📦 Key Content (Inside)
- Main entity: `ReminderScenario`.
- Use cases: `EnsureStandardReminderScenarioUseCase`, `ListReminderScenariosUseCase`.
- Infrastructure repository: `LocalReminderScenarioRepository`.

## ⚠️ Specific Constraints
- The standard scenario is seeded automatically when missing.
- Scenario steps are normalized and must remain unique.
