---
applyTo: "**/*.html, **/*.scss, tailwind.config.*"
excludeAgent: ["code-review"]
---

# Instructions Copilot - Design Tokens & Tailwind Modularity

Tu es un expert en Design System et en intégration Tailwind CSS. Ta mission est de garantir que nos composants UI sont "Themables" et facilement maintenables. Pour cela, nous interdisons l'utilisation de valeurs Tailwind fixes pour les éléments de branding ou de structure récurrente, au profit de "Design Tokens" définis dans le `tailwind.config.js`.

## 1. Philosophie : Sémantique > Valeur Fixe
Le HTML ne doit pas décrire *à quoi* ressemble l'élément (ex: bleu, arrondi xl), mais *ce qu'il est* (ex: couleur primaire, carte).
- **Couleurs :** Ne jamais utiliser de couleurs directes comme `indigo-600` ou `gray-50` pour le branding, les fonds de cartes ou les bordures. Utiliser des tokens sémantiques (ex: `bg-primary`, `bg-surface`, `border-default`).
- **Structure (Radius) :** Les arrondis structurels majeurs (cartes, inputs, boutons) doivent utiliser des tokens (ex: `rounded-card`, `rounded-input`) plutôt que `rounded-xl` ou `rounded-md`.

## 2. Règle de Génération (Double Action)
Lorsque tu dois générer un composant avec son style Tailwind :
1. **Écris le HTML avec des Design Tokens.** (Même s'ils n'existent pas encore).
2. **Propose systématiquement la mise à jour du `tailwind.config.js`** si tu as inventé un nouveau token sémantique pour répondre au besoin du design.

## 3. Exemple de Transformation (Avant / Après)

**❌ INTERDIT (Valeurs codées en dur) :**
```html
<div class="bg-gray-50">
  <div class="bg-white rounded-xl border-gray-100">...</div>
  <button class="bg-indigo-600 hover:bg-indigo-700 rounded-md">Valider</button>
  <input class="border-gray-300 focus:ring-indigo-500 rounded-md" />
</div>
```

**✅ ATTENDU (Design Tokens Sémantiques) :**
```html
<div class="bg-background">
  <div class="bg-surface rounded-card border-subtle">...</div>
  <button class="bg-primary hover:bg-primary-hover rounded-btn text-primary-content">Valider</button>
  <input class="border-input focus:ring-primary focus:border-primary rounded-input" />
</div>
```

## 4. Contrat du Tailwind Config

Voici à quoi notre configuration cible ressemble. Appuie-toi sur cette logique pour nommer tes classes dans le HTML :
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Branding
        primary: {
          DEFAULT: 'var(--color-primary, #4f46e5)', // Ex: l'ancien indigo-600
          hover: 'var(--color-primary-hover, #4338ca)',
          content: 'var(--color-primary-content, #ffffff)',
        },
        // Surfaces & Backgrounds
        background: 'var(--color-background, #f9fafb)', // Ex: l'ancien gray-50
        surface: 'var(--color-surface, #ffffff)',       // Fond de carte
        // Borders
        subtle: 'var(--color-border-subtle, #f3f4f6)',
        input: 'var(--color-border-input, #d1d5db)',
      },
      borderRadius: {
        card: 'var(--radius-card, 0.75rem)',    // Ex: ancien xl
        btn: 'var(--radius-btn, 0.375rem)',     // Ex: ancien md
        input: 'var(--radius-input, 0.375rem)', // Ex: ancien md
      }
    }
  }
}
```

## 5. Cas d'Usage de Copilot

Si tu traduis un design et que tu vois un bouton vert :
- Tu ne mets pas `bg-green-500`.
- Tu mets `bg-success` (ou `bg-primary` si c'est la couleur principale de la marque).
- Tu ajoutes à la fin de ta réponse : "Note: N'oubliez pas d'ajouter la couleur success: '#22c55e' dans votre tailwind.config.js si elle n'y est pas déjà."
