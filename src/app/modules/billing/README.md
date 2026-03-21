# Billing Module

## 📍 Rôle (What)
Gérer le cycle métier de création et modification de facture, incluant la création et la mise à jour enrichies avec validations des invariants de facturation.

## 📦 Contenu Clé (Inside)
- Entité métier principale: `Bill`.
- Use cases: `CreateDraftBillUseCase`, `CreateEnrichedBillUseCase`, `UpdateEnrichedBillUseCase`.
- Composant UI majeur: `new-bill` (formulaire basé sur Form Object typed dans `presentation/forms/new-bill.form.ts`).
- Repository billing: switchable `LocalBillRepository` / `FirestoreBillRepository` via `resolveBillRepositoryClass`.

## ⚠️ Contraintes spécifiques
- Les validations métier de la facture enrichie sont centralisées dans le domaine (entité + use case), avant tout couplage UI.
- Le flux de création de facture n'utilise plus de scénario de relance; le mode `+ Nouveau` client est inline et conserve les données saisies lors du retour au mode client existant.
- Le formulaire `new-bill` affiche désormais des erreurs champ-par-champ et un style visuel d'erreur uniquement après une tentative de soumission invalide, pour un feedback utilisateur explicite sans bruit initial.
- Après une création réussie, la présentation affiche une modal de succès accessible (fermeture explicite via bouton) et réinitialise complètement le formulaire pour une nouvelle saisie.
- L'intégration Billing ↔ Clients passe par un port public (`QuickClientCreatorPort`) pour éviter la dépendance directe à une classe de use case concrète.
- Le repository billing expose désormais une opération `update` et lève `BillNotFoundError` si la facture n'existe pas en persistance locale.
- En mode Firestore, les écritures/lectures billing sont strictement isolées par `ownerUid` (uid de session courant).
- La relation facture ↔ chantier est désormais portée par `chantierId` (clé stable), avec conservation du mapping legacy via l’alias `bill.chantier` pour compatibilité transitoire.
