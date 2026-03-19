# Billing Module

## 📍 Rôle (What)
Gérer le cycle métier de création de facture, incluant la création enrichie avec validations des invariants de facturation.

## 📦 Contenu Clé (Inside)
- Entité métier principale: `Bill`.
- Use cases: `CreateDraftBillUseCase`, `SubmitNewBillUseCase`, `CreateEnrichedBillUseCase`.
- Composant UI majeur: `new-bill`.

## ⚠️ Contraintes spécifiques
- Les validations métier de la facture enrichie sont centralisées dans le domaine (entité + use case), avant tout couplage UI.
