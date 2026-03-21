# Clients Module

## 📍 Rôle (What)
Gérer le référentiel des clients utilisables dans les flux de facturation.

## 📦 Contenu Clé (Inside)
- Entité métier principale: `Client`.
- Use cases: `CreateQuickClientUseCase`, `ListClientsUseCase`, `UpdateClientUseCase`.
- Port repository: `ClientRepository` avec implémentations `LocalClientRepository` et `FirestoreClientRepository`.

## ⚠️ Contraintes spécifiques
- En mode Firestore, les lectures/écritures sont strictement filtrées par `ownerUid` (uid de session courant).
- Les documents sans `ownerUid` sont considérés inaccessibles.
