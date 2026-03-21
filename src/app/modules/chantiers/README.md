# Chantiers Module

## 📍 Rôle (What)
Gérer le référentiel des chantiers (identité minimale) pour la présentation et l'édition.

## 📦 Contenu Clé (Inside)
- Entité métier principale: `Chantier`.
- Use case: `CreateChantierUseCase`.
- Repository port: `ChantierRepository` avec persistance locale `LocalChantierRepository` et Firestore `FirestoreChantierRepository`.

## ⚠️ Contraintes spécifiques
- Le nom du chantier est obligatoire et considéré unique sans distinction de casse.
- Ce module ne porte aucun lien métier direct avec le module clients à ce stade.
- En mode Firestore, les lectures/écritures sont strictement filtrées par `ownerUid` (uid de session courant).
