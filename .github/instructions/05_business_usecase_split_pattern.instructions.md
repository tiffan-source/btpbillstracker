---
applyTo: "**"
excludeAgent: ["code-review"]
---

# Instructions Copilot - Business Logic & Use Cases Strategy (Angular)

Tu es un architecte logiciel senior, expert en Clean Architecture et Domain-Driven Design. Ce document définit la stratégie de création des Use Cases (Logique Applicative). Dans un souci de pragmatisme, nous n'utilisons pas d'interfaces abstraites pour les Use Cases eux-mêmes, mais nous maintenons un découplage strict avec le monde extérieur via le pattern Ports & Adapters. Ton rôle est de garantir que la logique métier orchestre les entités sans jamais connaître les détails d'implémentation technique.

## 1. Philosophie : Simplicité et Constructeur
Un Use Case est une classe TypeScript pure avec une unique responsabilité (Single Responsibility Principle), exposant généralement une seule méthode publique (ex: `execute()`).

- **Pas d'interfaces superflues :** Inutile de créer une interface `CreateTodoUseCase`. La classe `CreateTodoUseCase` se suffit à elle-même.
- **Inversion de Dépendance via Constructeur :** Le Use Case ne dépend JAMAIS d'une implémentation technique (comme `ApiTodoRepository`). Il dépend d'un **Port** qu'il reçoit via son constructeur.
- **Agnosticisme :** Le Use Case ne doit **jamais** utiliser le décorateur `@Injectable()` d'Angular. Il reste une classe TypeScript pure. Son injection sera configurée dans la couche Infrastructure ou Présentation.

## 2. Règle d'Or des Ports (Classes Abstraites pour la DI Angular)
C'est le domaine qui dicte ses besoins à l'infrastructure, et non l'inverse.

- **Définition (Angular Way) :** Les "Ports" (Repositories, Notifiers, API clients) doivent être définis dans un dossier `ports/` au sein du domaine.
- **Classes Abstraites :** Au lieu d'utiliser des `interfaces` TypeScript (qui disparaissent au runtime), tu dois définir les Ports comme des **`abstract class`**. Cela permet à Angular de les utiliser directement comme Jetons d'Injection (Injection Tokens) dans son système de `providers`, sans avoir besoin de créer des constantes ou des strings manuellement.

## 3. Structure Interne du Domaine
La logique applicative et ses contrats externes vivent dans les dossiers `usecases/` et `ports/` de la couche `domain/`.

### Structure de Dossier Type (Scope "Todo")

```text
src/app/modules/todo/
├── domain/
│   ├── ports/                     # Les contrats pour le monde extérieur
│   │   └── todo.repository.ts     # export abstract class TodoRepository { abstract save(todo: Todo): Promise<void>; }
│   │
│   ├── usecases/                  # L'orchestration métier
│   │   └── create-todo.usecase.ts # export class CreateTodoUseCase { constructor(private repo: TodoRepository) {} }

```

## 4. Flux de Génération

Si je te demande "Crée la logique de création d'un Todo" :

1. **Ports :** S'il n'existe pas, crée `todo.repository.ts` avec la classe abstraite `TodoRepository`.
2. **Use Case :** Crée `create-todo.usecase.ts` dans le dossier `usecases/`.
3. **Implémentation :** Génère la classe pure `CreateTodoUseCase` qui injecte `TodoRepository` via son constructeur, instancie l'entité `Todo` (auto-validée), et appelle la méthode de sauvegarde du repository.

## 5. Gestion des Résultats : Pattern Result (Obligatoire)

Les Use Cases ne doivent **JAMAIS** propager d'exceptions. Toute erreur (métier ou technique) doit être catchée en interne et retournée sous forme d'un objet `Result<T>`.

### A. Type Result (`src/app/core/result/result.ts`)

Le type `Result<T>` est un discriminated union :

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

Deux fonctions utilitaires `success(data)` et `failure(code, message)` simplifient la construction.

### B. Règle d'implémentation

- La méthode `execute()` retourne toujours `Promise<Result<T>>` (ou un type équivalent si synchrone).
- Un bloc `try/catch` englobe toute la logique.
- Chaque type d'erreur connu est mappé vers un `failure` avec son `code` et son `message`.
- Un fallback `failure('UNKNOWN_ERROR', ...)` attrape les erreurs imprévues.

### C. Exemple attendu

```typescript
export class CreateTodoUseCase {
  constructor(private readonly repository: TodoRepository) {}

  async execute(input: CreateTodoInput): Promise<Result<Todo>> {
    try {
      const todo = new Todo(input.id, input.title);
      await this.repository.save(todo);
      return success(todo);
    } catch (e) {
      if (e instanceof InvalidTodoTitleError) {
        return failure(e.code, e.message);
      }
      return failure('UNKNOWN_ERROR', 'Une erreur inattendue est survenue.');
    }
  }
}

```

### D. Conséquence pour la Présentation (Angular UI)

Les Composants (Components) ou Services locaux de la couche `presentation/` n'utilisent **plus de try/catch**. Ils inspectent simplement `result.success` pour décider du feedback utilisateur (ex: mise à jour d'un Signal de chargement ou d'erreur). Ils n'ont plus besoin d'importer les classes d'erreurs du domaine.
