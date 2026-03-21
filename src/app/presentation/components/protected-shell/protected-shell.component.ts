import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-protected-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="bg-background text-foreground lg:flex">
      <aside class="bg-sidebar text-sidebar-foreground min-h-screen hidden w-64 flex-col lg:flex">
        <header class="border-sidebar-subtle flex items-center gap-3 border-b p-6">
          <div class="bg-warning flex h-10 w-10 items-center justify-center rounded-card" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="h-5 w-5 text-primary-content" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 13h16v7H4z" />
              <path d="M8 13V9a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-semibold">RelanceBTP</p>
            <p class="text-sidebar-muted text-sm">Suivi de factures</p>
          </div>
        </header>

        <nav aria-label="Navigation principale" class="flex flex-col gap-2 p-4">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-sidebar-hover text-sidebar-foreground"
            [routerLinkActiveOptions]="{ exact: true }"
            ariaCurrentWhenActive="page"
            data-testid="nav-link-dashboard"
            class="text-sidebar-muted rounded-card hover:bg-sidebar-hover hover:text-sidebar-foreground flex items-center gap-3 px-4 py-3 text-sm"
          >
            <span aria-hidden="true">▦</span>
            <span>Tableau de bord</span>
          </a>
          <a
            routerLink="/new-bill"
            routerLinkActive="bg-sidebar-hover text-sidebar-foreground"
            [routerLinkActiveOptions]="{ exact: true }"
            ariaCurrentWhenActive="page"
            data-testid="nav-link-new-bill"
            class="text-sidebar-muted rounded-card hover:bg-sidebar-hover hover:text-sidebar-foreground flex items-center gap-3 px-4 py-3 text-sm"
          >
            <span aria-hidden="true">⊞</span>
            <span>Ajouter une facture</span>
          </a>
          <button
            type="button"
            data-testid="nav-disabled-reminders"
            class="text-sidebar-muted rounded-card flex items-center gap-3 px-4 py-3 text-left text-sm"
            disabled
            aria-disabled="true"
          >
            <span aria-hidden="true">◷</span>
            <span>Planning relances</span>
          </button>
          <button
            type="button"
            data-testid="nav-disabled-templates"
            class="text-sidebar-muted rounded-card flex items-center gap-3 px-4 py-3 text-left text-sm"
            disabled
            aria-disabled="true"
          >
            <span aria-hidden="true">◌</span>
            <span>Modèles de messages</span>
          </button>
          <a
            routerLink="/clients-chantiers"
            routerLinkActive="bg-sidebar-hover text-sidebar-foreground"
            [routerLinkActiveOptions]="{ exact: true }"
            ariaCurrentWhenActive="page"
            data-testid="nav-link-clients-chantiers"
            class="text-sidebar-muted rounded-card hover:bg-sidebar-hover hover:text-sidebar-foreground flex items-center gap-3 px-4 py-3 text-sm"
          >
            <span aria-hidden="true">◉</span>
            <span>Clients & Chantiers</span>
          </a>
        </nav>

        <footer class="border-sidebar-subtle text-sidebar-muted mt-auto border-t p-4 text-center text-xs">
          RelanceBTP v1.0
        </footer>
      </aside>

      <div class="min-h-screen flex-1">
        <router-outlet />
      </div>
    </div>
  `
})
export class ProtectedShellComponent {}
