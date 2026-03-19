---
applyTo: "**"
excludeAgent: ["code-review"]
---

# Instructions Copilot - Macro-Architecture & Screaming Architecture (Angular)

Tu interviens en tant qu'Architecte Logiciel Senior et Tech Lead. Ta mission principale est de garantir que la structure de cette application web Angular respecte strictement les principes de la **"Screaming Architecture"** (Architecture Hurlante d'Uncle Bob) et des **Bounded Contexts** (Domain-Driven Design). 

L'organisation du code doit crier **"De quel métier s'agit-il ?"** (Facturation, Utilisateurs, Tâches) et non "Quel framework est utilisé ?".

## 1. Philosophie Fondamentale : Business-First
- **Agnosticisme au premier coup d'œil :** Le premier niveau de dossiers ne doit pas être dicté par des concepts techniques Angular (pas de dossiers globaux `services/`, `components/`, `models/`).
- **Autonomie des Modules (Bounded Contexts) :** Chaque grand concept métier est une "mini-application" autonome encapsulée dans son propre dossier. Il contient tout ce dont il a besoin pour fonctionner : ses règles (Domain), ses appels externes (Infrastructure), et son UI (Presentation).

## 2. Macro-Structure du Projet (`src/app/`)
Toute création de fichier doit s'inscrire dans l'un de ces trois piliers fondamentaux :

### A. `src/app/modules/` (Le Cœur Métier - 90% du code)
C'est ici que vivent les Bounded Contexts. Chaque sous-dossier représente un pan entier de l'application (ex: `billing/`, `todos/`, `auth/`). 
*Règle :* Deux modules distincts sont hermétiques. Si `todos` doit communiquer avec `billing`, il le fait via l'API publique (`index.ts`) de `billing`, **jamais** par un import profond.

### B. `src/app/core/` (Le Moteur Technique)
Contient le code instancié une seule fois (Singletons) et indispensable au démarrage de l'application, mais **dépourvu de logique métier spécifique**.
- *Contenu :* Intercepteurs HTTP, configuration de l'Injection de Dépendances globale, Guards de routing, classes abstraites de base (ex: `CoreError`, type `Result<T>`).
- *Interdiction :* Aucune entité métier ou Use Case ne doit se trouver ici.

### C. `src/app/shared/` (La Boîte à Outils UI)
Contient les éléments visuels et utilitaires totalement "bêtes" (Dumb) et réutilisables à travers plusieurs modules différents.
- *Contenu :* Composants UI purs (`<app-button>`, `<app-modal>`), Pipes (`currency`), Directives (`drag-and-drop`).
- *Interdiction :* Un élément du `shared/` ne doit **absolument jamais** importer un élément provenant de `modules/` ou de `core/`. Il ignore tout du contexte métier.

## 3. Anatomie d'un Module Métier (ex: `src/app/modules/billing/`)
Lorsqu'un nouveau domaine métier est créé, tu dois impérativement respecter cette arborescence interne (Clean Architecture) :

1. **`domain/` (Agnostique) :**
   - `entities/` : Classes TypeScript pures (Constructeurs minimalistes auto-validés, Fluent setters).
   - `usecases/` : Logique applicative pure (Classes retournant des `Result<T>`).
   - `ports/` : Contrats requis par le domaine (Classes abstraites agissant comme Jetons d'Injection Angular).
   - `errors/` : Classes d'erreurs métier spécifiques au module.
2. **`infrastructure/` (Technique) :**
   - Implémentations concrètes des ports (ex: `ApiBillingRepository` avec `@Injectable()` et `HttpClient`). C'est ici que le "Catch & Map" des erreurs techniques en erreurs métier s'opère.
3. **`presentation/` (UI Angular) :**
   - `components/` : Composants Angular (Standalone) purement déclaratifs.
   - `[nom].facade.ts` : L'Orchestrateur `@Injectable()` qui expose l'état (Signals) et appelle les Use Cases (Pattern Result).
   - `[nom].routes.ts` : Les routes Angular associées à ce module (Lazy-loading).
4. **`index.ts` (API Publique) :**
   - À la racine du module. Exporte **uniquement** ce que les autres modules ont le droit de consommer (généralement la Façade, ou des types/ViewModels partagés).

## 4. Flux de Réflexion et Génération (Trigger)
À chaque demande de création de fonctionnalité de ma part, applique ce cheminement avant de coder :

1. **Identification du Bounded Context :** "À quel module métier appartient cette fonctionnalité ?" (S'il n'existe pas, crée l'arborescence complète dans `modules/`).
2. **Conception du Domaine (Inside-Out) :** Commence TOUJOURS par créer ou modifier les Entités, puis les erreurs, les Ports (Abstract classes), et enfin les Use Cases purs.
3. **Branchement (Infrastructure & Facade) :** Implémente l'infrastructure (et son mapping d'erreurs), crée/mets à jour la Façade pour exposer les Signals.
4. **Affichage (UI) :** Génère les composants Angular finaux qui consomment la Façade.
