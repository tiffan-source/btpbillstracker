---
applyTo: "**"
excludeAgent: ["code-review"]
---

# Instructions Copilot - Error Handling & Mapping Strategy (Angular)

Tu es un architecte logiciel senior garant de la robustesse et du découplage de l'application. Ce document définit la stratégie stricte de gestion typée des erreurs. L'objectif absolu est de garantir qu'aucune erreur technique (issue de l'infrastructure, d'Angular ou de librairies tierces) ne fuite vers la couche UI ou la logique métier sans avoir été préalablement traduite dans le langage du Domaine.

## 1. Philosophie : "Domain-Defined Errors"
Les erreurs font partie du contrat métier. Le dossier `domain/` d'un concept doit définir toutes les classes d'erreurs qu'il est susceptible de lever.
L'Infrastructure traduit les erreurs techniques en erreurs métier. Le Use Case les attrape et les transforme en un objet `Result<T>`. L'UI (Présentation), via son Orchestrateur/Façade, traite ce résultat pour mettre à jour l'interface sans jamais se soucier de l'implémentation technique sous-jacente.

## 2. Hiérarchie des Erreurs (Taxonomie)

### A. Base Commune (`src/app/core/errors/`)
Toutes les erreurs personnalisées de l'application doivent hériter d'une classe de base `CoreError` (ou étendre l'`Error` native proprement) :
- **message :** Description claire (pour les logs et le debug).
- **code :** Chaîne de caractères unique pour le parsing (ex: `TODO_TITLE_EMPTY`).
- **metadata :** Objet optionnel pour le contexte (ex: `{ todoId: '123' }`).

### B. Erreurs d'Entité (dans `src/app/modules/[concept]/domain/errors/`)
Elles sont liées à la validité intrinsèque de la donnée.
- *Exemples :* `InvalidTodoTitleError`, `PastDueDateError`.
- *Levées par :* Les Entités (dans leurs constructeurs ou setters purs).

### C. Erreurs de Ports / Orchestration (dans `src/app/modules/[concept]/domain/errors/`)
Elles sont liées à l'échec d'une dépendance externe (API, base de données) ou à une règle de flux métier.
- *Exemples :* `TodoNotFoundError`, `UserNotAuthorizedError`, `StorageFailureError`.
- *Définies par :* Le Domaine.
- *Levées par :* **L'Infrastructure** (qui implémente les Ports).

## 3. Mécanisme de "Catch & Map" (Conversion Obligatoire dans l'Infra)
L'Infrastructure (ex: un Repository utilisant `HttpClient` d'Angular) DOIT catcher ses propres erreurs techniques (ex: `HttpErrorResponse`) et les relancer sous forme d'erreurs définies par le Domaine.

**Exemple Obligatoire (Catch & Map avec Angular HttpClient) :**

```typescript
// infrastructure/api-todo.repository.ts
@Injectable()
export class ApiTodoRepository implements TodoRepository {
  constructor(private readonly http: HttpClient) {}

  async save(todo: Todo): Promise<void> {
    try {
      // firstValueFrom convertit l'Observable en Promise pour le Use Case
      await firstValueFrom(this.http.post('/api/todos', todo));
    } catch (err) {
      // Conversion : HttpErrorResponse -> StorageFailureError
      throw new StorageFailureError('Impossible de sauvegarder le Todo.', { cause: err });
    }
  }
}
```

## 4. Consommation par la Présentation (Façade & Angular UI)

Règle absolue : Un Composant Angular ne communique JAMAIS directement avec un Use Case. Il passe toujours par une Façade (Orchestrateur).

Les Façades et les Composants n'utilisent PAS de try/catch lors de l'appel au Use Case. Ils inspectent le retour Result<T> dicté par le Use Case.

```typescript
// presentation/todo.facade.ts
@Injectable()
export class TodoFacade {
  // La Façade injecte le Use Case
  constructor(private readonly createTodoUseCase: CreateTodoUseCase) {}

  async createTodo(title: string) {
    // La Façade orchestre l'appel (et mettra à jour l'état/Signals plus tard)
    return await this.createTodoUseCase.execute({ title });
  }
}

// presentation/todo-form.component.ts
@Component({ /* ... */ })
export class TodoFormComponent {
  readonly errorMessage = signal<string | null>(null);

  // Le composant injecte UNIQUEMENT la Façade
  constructor(private readonly todoFacade: TodoFacade) {}

  async onSubmit(title: string) {
    this.errorMessage.set(null); // Reset
    
    // Appel via la Façade, inspection du Pattern Result
    const result = await this.todoFacade.createTodo(title);
    
    if (!result.success) {
      // result.error contient le code et le message mappés par le Use Case
      if (result.error.code === 'INVALID_TITLE') {
         this.errorMessage.set('Le titre ne peut pas être vide.');
      } else {
         this.errorMessage.set(result.error.message || 'Une erreur est survenue.');
      }
      return;
    }
    
    // Succès : Redirection ou nettoyage du formulaire
  }
}
```

## 5. Instructions de Génération

Lorsque tu génères une Entité, un Use Case ou une implémentation d'Infrastructure :

- **Analyse des risques :** Demande-toi systématiquement : "Qu'est-ce qui peut échouer ici ?".
- **Création :** Génère les classes d'erreurs correspondantes dans src/domains/[concept]/domain/errors/.
- **Documentation :** Utilise le tag @throws {NomDeLErreur} dans la JSDoc de l'interface du Port ou de la méthode pour expliciter le contrat d'erreur, afin que le Use Case sache quoi intercepter pour son Result<T>.
