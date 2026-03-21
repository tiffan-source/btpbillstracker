# Auth Module

## 📍 Rôle (What)
Gérer l'identité utilisateur, l'authentification et l'état de session pour sécuriser l'accès aux routes et aux données.

## 📦 Contenu Clé (Inside)
- Port domaine: `AuthIdentityPort`.
- Modèle partagé: `AuthUser`.
- Use cases: `RegisterWithEmailUseCase`, `LoginWithEmailUseCase`, `LoginWithGoogleUseCase`, `LoginWithFacebookUseCase`, `RequestPasswordResetUseCase`, `SendEmailVerificationUseCase`, `SignOutUseCase`, `GetCurrentUserUseCase`.
- Implémentation infrastructure: `FirebaseAuthIdentity`.
- Service présentation: `AuthSessionFacade`.
- Providers Angular: `AUTH_PROVIDERS`.
- Pages auth: login/register/reset-password/account/verify-email (reset/account reliées aux flux réels façade).
- Guards présentation: `authRequiredGuard`, `verifiedWriteAccessGuard` avec `returnUrl`.

## ⚠️ Contraintes spécifiques
- Les règles d'accès métier doivent rester alignées avec la policy d'authentification et les règles Firestore ownerUid.
