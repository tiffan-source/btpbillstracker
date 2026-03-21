# Auth Module

## 📍 Rôle (What)
Gérer l'identité utilisateur, l'authentification et l'état de session pour sécuriser l'accès aux routes et aux données.

## 📦 Contenu Clé (Inside)
- Port domaine: `AuthIdentityPort`.
- Modèle partagé: `AuthUser`.
- Implémentation infrastructure: `FirebaseAuthIdentity`.
- Service présentation: `AuthSessionFacade`.
- Pages auth: login/register/reset-password/account/verify-email.

## ⚠️ Contraintes spécifiques
- Les règles d'accès métier doivent rester alignées avec la policy d'authentification et les règles Firestore ownerUid.
