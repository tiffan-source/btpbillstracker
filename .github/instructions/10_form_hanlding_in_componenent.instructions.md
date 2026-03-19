---
applyTo: "**/*.ts, **/*.html"
excludeAgent: ["code-review"]
---

# Instructions Copilot - Form Object Pattern & Typed Forms (Angular)

Tu es un architecte Angular expert. Ta mission est de garder nos composants UI (Presentation) le plus "Dumb" (stupides et légers) possible. Pour cela, nous interdisons formellement de construire des formulaires complexes (via `FormBuilder` ou `new FormGroup`) directement à l'intérieur des fichiers `.component.ts`. 

Nous utilisons le **Form Object Pattern** avec les **Typed Forms** d'Angular.

## 1. Philosophie : Externalisation de la Logique de Saisie
Un formulaire est une entité logique à part entière. Il possède son état (valide, invalide, touché), ses valeurs par défaut et ses règles de validation croisées.
Toute cette logique doit être extraite dans un fichier dédié sous le dossier `presentation/forms/`.

## 2. Règle de Création (La Classe FormGroup)
Lorsqu'un composant nécessite un formulaire (Reactive Forms) :
1.  **Crée un fichier `.form.ts` :** (ex: `invoice.form.ts`).
2.  **Définis le typage strict :** Crée une interface pour le modèle du formulaire.
3.  **Étends `FormGroup` :** Crée une classe qui étend `FormGroup<MonModele>`.
4.  **Encapsule la validation :** Le `super()` du constructeur doit initialiser tous les `FormControl`, `FormArray`, ou sous-`FormGroup` avec leurs `Validators` (synchrones et asynchrones).

## 3. Exemple Attendu (Le Form Object)

```typescript
// src/app/modules/billing/presentation/forms/invoice.form.ts
import { FormControl, FormGroup, Validators } from '@angular/forms';

// 1. Typage strict du formulaire (Angular Typed Forms)
export interface InvoiceFormModel {
  clientId: FormControl<string | null>;
  amountTTC: FormControl<number | null>;
  dueDate: FormControl<string | null>;
}

// 2. La classe qui encapsule la logique
export class InvoiceForm extends FormGroup<InvoiceFormModel> {
  constructor() {
    super({
      clientId: new FormControl(null, { validators: [Validators.required] }),
      amountTTC: new FormControl(null, { validators: [Validators.required, Validators.min(1)] }),
      dueDate: new FormControl(null, { validators: [Validators.required] })
    });
  }

  // 3. Helpers optionnels encapsulés dans le formulaire
  get isAmountValid(): boolean {
    return this.controls.amountTTC.valid;
  }

  getPayload() {
    return this.getRawValue(); // Retourne les données typées prêtes pour le Use Case
  }
}
```

## 4. Intégration dans le Composant (Génération de la Vue)

Le composant Angular devient un simple passe-plat. Il instancie la classe et la lie au template. Il n'injecte pas `FormBuilder`.

```typescript
// src/app/modules/billing/presentation/components/add-invoice.component.ts
@Component({ ... })
export class AddInvoiceComponent {
  // Instanciation directe du Custom FormGroup
  readonly form = new InvoiceForm();

  constructor(private readonly facade: BillingFacade) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    // Le composant délègue la donnée extraite du form à la façade
    this.facade.createInvoice(this.form.getPayload());
  }
}
```

## 5. Flux de Génération (Trigger)

Si je te demande "Crée le formulaire pour la création d'utilisateur" :

1.  **Logique Formulaire :** Tu génères d'abord `user.form.ts` contenant l'interface du modèle et la classe étendant `FormGroup` avec toutes les validations pertinentes.
2.  **Logique Composant :** Tu génères `user-form.component.ts` qui instancie cette classe proprement.
3.  **Template :** Tu génères le HTML en bindant `[formGroup]="form"` et `formControlName="..."`.
