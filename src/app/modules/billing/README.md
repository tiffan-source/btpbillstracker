# Billing Module

## 📍 Rôle (What)
Gérer le cycle métier de création de facture, incluant la création enrichie avec validations des invariants de facturation.

## 📦 Contenu Clé (Inside)
- Entité métier principale: `Bill`.
- Use cases: `CreateDraftBillUseCase`, `SubmitNewBillUseCase`, `CreateEnrichedBillUseCase`.
- Composant UI majeur: `new-bill` (formulaire basé sur Form Object typed dans `presentation/forms/new-bill.form.ts`).

## ⚠️ Contraintes spécifiques
- Les validations métier de la facture enrichie sont centralisées dans le domaine (entité + use case), avant tout couplage UI.
- Le flux de création de facture n'utilise plus de scénario de relance; le mode `+ Nouveau` client est inline et conserve les données saisies lors du retour au mode client existant.
- Le formulaire `new-bill` affiche désormais des erreurs champ-par-champ et un style visuel d'erreur uniquement après une tentative de soumission invalide, pour un feedback utilisateur explicite sans bruit initial.
- Après une création réussie, la présentation affiche une modal de succès accessible (fermeture explicite via bouton) et réinitialise complètement le formulaire pour une nouvelle saisie.
