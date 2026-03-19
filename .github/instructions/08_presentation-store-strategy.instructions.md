---
applyTo: "**/*.ts, **/*.html"
excludeAgent: ["code-review"]
---

# Instructions Copilot - Presentation Layer, Agnostic Store & Facade Strategy (Angular)

Tu es un architecte logiciel senior, expert en Angular et en Clean Architecture. Ce document définit la stratégie d'implémentation de la couche de présentation. Ton rôle est de garantir le découplage total entre l'UI (Components), le domaine métier (Use Cases) et la librairie de gestion d'état, tout en appliquant le pattern "Store as Presenter" (transformation des Entités en ViewModels) orchestré par une Façade.

## 1. Philosophie : La Façade, le Store Agnostique et les ViewModels
La couche de présentation Angular utilise des **Façades** (Services `@Injectable()`) pour lier l'UI, les Use Cases (Domaine) et l'état global (Store).
- **Agnosticisme strict :** Les Façades et les Composants n'importent JAMAIS de librairies d'état spécifiques (NgRx, Akita, Elf, ou BehaviorSubjects complexes). Ils n'utilisent que des abstractions et des Signals natifs.
- **Le Store comme Presenter :** Le Store abstrait est responsable de recevoir les Entités du domaine (ex: `Todo`) et de les transformer en données prêtes pour l'UI (`TodoViewModel`). Le Store ne stocke et n'expose QUE des ViewModels.
- **Composants Stupides (Dumb) :** Un Composant UI n'injecte **JAMAIS** un Use Case ni un Store directement. Il n'injecte **QUE** la Façade correspondante.

## 2. Contrats de la Couche Présentation (ViewModels & Store Port)
Les données stockées pour l'UI doivent être de purs objets (ViewModels). Le contrat du Store est défini par une `abstract class` qui expose des **Signals** (en lecture seule) et des méthodes de mutation qui consomment des Entités.

```typescript
// Exemple attendu : src/app/modules/todo/presentation/ports/todo.store.ts
import { Signal } from '@angular/core';
import { Todo } from '../../domain/entities/todo.entity';

export type TodoViewModel = {
    id: string;
    title: string;
    isCompleted: boolean;
};

// Jeton d'injection abstrait
export abstract class TodoStore {
    abstract readonly todos: Signal<TodoViewModel[]>;

    abstract initialiseTodos(todos: Todo[]): void;
    abstract addTodo(todo: Todo): void;
    abstract removeTodo(id: string): void;
}

```

## 3. L'Orchestrateur (Pattern Façade)

La Façade gère l'état local éphémère de l'UI (loading, form errors via des Signals locaux), gère les flux de données via le pattern `Result<T>`, appelle les Use Cases, et délègue la mise à jour (et le formatage ViewModel) au Store abstrait.

### Règles d'implémentation de la Façade

1.  **Injection :** La Façade injecte le(s) Use Case(s) et le `TodoStore` (l'abstraction).

2.  **Exposition de l'état :** Elle expose les Signals du Store et ses propres Signals de statut UI pour que le composant puisse s'y binder.

3.  **Gestion des erreurs :** Les Use Cases retournent toujours un objet `Result<T>`. La Façade ne doit PAS utiliser `try/catch` pour la logique métier, mais vérifier `result.success`.

```typescript
// Exemple attendu : src/app/modules/todo/presentation/todo.facade.ts
import { Injectable, signal } from '@angular/core';
import { CreateTodoUseCase } from '../../domain/usecases/create-todo.usecase';
import { TodoStore } from './ports/todo.store';

@Injectable()
export class TodoFacade {
  // 1. État local de l'UI géré par la Façade
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  // 2. Exposition de l'état global (ViewModel) depuis le Store abstrait
  readonly todos = this.todoStore.todos;

  constructor(
    private readonly createTodoUseCase: CreateTodoUseCase,
    private readonly todoStore: TodoStore // Injection via l'abstract class
  ) {}

  async submitNewTodo(title: string): Promise<void> {
    this.error.set(null);
    this.isSubmitting.set(true);

    // 3. Appel du Use Case (retourne un Result<Entité>)
    const result = await this.createTodoUseCase.execute({ title });

    if (result.success) {
      // 4. Délégation au Store/Presenter (qui transformera en TodoViewModel)
      this.todoStore.addTodo(result.data);
    } else {
      // 5. Gestion des erreurs métiers
      this.error.set(result.error.message);
    }

    this.isSubmitting.set(false);
  }
}
```

## 4. Consommation par le Composant Angular (UI)

Le composant devient purement déclaratif. Il injecte la Façade, lit ses Signals dans le template HTML, et appelle ses méthodes lors des événements utilisateur.

```typescript
// Exemple attendu : src/app/modules/todo/presentation/components/todo-list.component.ts
@Component({
  selector: 'app-todo-list',
  template: `
    @if (facade.error()) {
      <div class="error">{{ facade.error() }}</div>
    }

    <ul>
      @for (todo of facade.todos(); track todo.id) {
        <li>{{ todo.title }}</li>
      }
    </ul>

    <button [disabled]="facade.isSubmitting()" (click)="addTodo('Nouveau Todo')">
      Ajouter
    </button>
  `
})
export class TodoListComponent {
  // Injection de l'Orchestrateur uniquement
  constructor(public readonly facade: TodoFacade) {}

  addTodo(title: string) {
    this.facade.submitNewTodo(title);
  }
}
```

## 5. Flux de Génération

Si je te demande "Crée l'orchestration pour afficher la liste des Todos" :

1.  **Vérification :** Assure-toi que le type `TodoViewModel`, le Signal `todos` et la méthode `initialiseTodos` existent dans l'interface `TodoStore`.

2.  **Mise à jour de la Façade :** Ajoute une méthode `loadTodos()` dans `TodoFacade`. Ajoute un signal local `isLoading = signal(false)` si nécessaire.

3.  **Logique de Fetch :** Appelle `getAllTodosUseCase.execute()` et gère le Result retourné. En cas de succès, passe le tableau d'Entités `Todo[]` à `this.todoStore.initialiseTodos` pour que l'implémentation concrète du store fasse la conversion en `TodoViewModel[]`
