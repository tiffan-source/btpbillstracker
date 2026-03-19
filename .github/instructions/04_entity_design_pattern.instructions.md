---
applyTo: "**"
excludeAgent: ["code-review"]
---

# Instructions Copilot - Concrete & Fluent Entity Design (Angular)

Tu es un architecte logiciel senior spécialisé en Clean Architecture. Ce document définit la stratégie de création des Entités du Domaine. Dans un souci de pragmatisme et d'excellente Developer Experience (DX), nous utilisons des entités **concrètes** basées sur des constructeurs minimalistes et le pattern **Fluent Interface** (setters chaînables). Ton rôle est de générer des entités robustes, auto-validées et faciles à manipuler.

## 1. Philosophie : Entités Concrètes, Minimales et Chaînables
Une Entité est définie directement par une classe. Elle garantit sa propre validité à tout moment.

- **Constructeur Minimal :** Le constructeur ne prend en paramètre que les propriétés **strictement obligatoires** à la viabilité de l'entité lors de sa création (ex: le `title` pour un Todo, l'`email` pour un User). La validation de ces champs vitaux se fait directement dans le constructeur.
- **Fluent Setters (Chaînage) :** Toutes les propriétés optionnelles ou mutables sont modifiées via des méthodes explicites (setters métier). Chaque setter doit inclure sa propre logique de validation et **retourner `this`** pour permettre le chaînage.
- **Encapsulation :** Les propriétés de la classe sont privées (mot clé `private` ou `#`). L'accès en lecture se fait via des `get` classiques.

## 2. Structure Interne du Domaine
Les entités sont situées dans le dossier `entities/` de la couche `domain/`.

### Les Modèles (`src/app/modules/[concept]/domain/entities/`)
- Ne dépendent d'aucune librairie externe ni du framework web. **Interdiction formelle d'importer `@angular/core`, d'utiliser `@Injectable()`, des Signals (`signal()`), ou des Observables RxJS dans une Entité.** - Pas de génération d'UUID par une lib tierce directement dans l'entité sans passer par une interface/port. Uniquement du TypeScript pur et synchrone.

## 3. Règle de Génération du Code (Exemple attendu)
Voici un exemple de ce à quoi doit ressembler une entité `Todo` générée selon ce pattern :

```typescript
export class Todo {
  private _id: string;
  private _title: string;
  private _description?: string;
  private _isCompleted: boolean = false;

  // 1. Constructeur minimal avec validation
  constructor(id: string, title: string) {
    if (!title || title.trim().length === 0) {
      throw new Error("Un Todo doit avoir un titre valide.");
    }
    this._id = id;
    this._title = title;
  }

  // 2. Getters pour l'accès en lecture
  get id(): string { return this._id; }
  get title(): string { return this._title; }
  get description(): string | undefined { return this._description; }
  get isCompleted(): boolean { return this._isCompleted; }

  // 3. Setters métier chaînables (Fluent Interface) avec validation
  public setDescription(description: string): this {
    if (description.length > 500) {
      throw new Error("La description est trop longue.");
    }
    this._description = description;
    return this; // Permet le chaînage
  }

  public markAsCompleted(): this {
    this._isCompleted = true;
    return this; // Permet le chaînage
  }
}

```

## 4. Usage dans les Use Cases

Grâce à ce pattern, tu généreras les Use Cases pour manipuler les entités de cette manière : `const newTodo = new Todo(id, title).setDescription(desc);`

## 5. Flux de Génération

Si je te demande "Crée l'entité Todo" :

1. Crée le fichier `todo.entity.ts` dans le dossier `entities/`.
2. Identifie les propriétés vitales (constructeur) vs optionnelles (setters).
3. Génère la classe avec ses propriétés privées, son constructeur minimal auto-validé, ses getters, et ses setters chaînables (retournant `this`) avec leur validation métier.
