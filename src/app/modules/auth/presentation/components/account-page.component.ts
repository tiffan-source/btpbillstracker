import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthSessionFacade } from '../services/auth-session.facade';

@Component({
  selector: 'app-account-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="bg-background text-foreground min-h-screen p-6">
      <h1 class="text-2xl font-semibold">Compte</h1>

      @if (facade.user(); as user) {
        <p class="mt-2 text-sm text-foreground-muted">Connecté avec: {{ user.email }}</p>

        @if (!user.emailVerified) {
          <p class="mt-3 text-sm text-foreground-muted">Votre email n'est pas encore vérifié.</p>
          <button
            type="button"
            class="bg-primary text-primary-content hover:bg-primary-hover rounded-btn mt-3 px-4 py-2"
            [disabled]="facade.isSubmitting()"
            (click)="onResendVerification()"
          >
            Renvoyer l'email de vérification
          </button>
        } @else {
          <p class="mt-3 text-sm text-foreground-muted">Email vérifié.</p>
        }

        <button
          type="button"
          class="border-input rounded-btn mt-6 border px-4 py-2"
          [disabled]="facade.isSubmitting()"
          (click)="onSignOut()"
        >
          Se déconnecter
        </button>
      } @else {
        <p class="mt-2 text-sm text-foreground-muted">Aucune session active.</p>
      }

      @if (successMessage()) {
        <p class="mt-3 text-sm text-foreground-muted">{{ successMessage() }}</p>
      }
      @if (facade.error()) {
        <p class="mt-2 text-sm text-foreground-muted">{{ facade.error() }}</p>
      }
    </main>
  `
})
export class AccountPageComponent {
  readonly facade = inject(AuthSessionFacade);
  readonly successMessage = signal<string | null>(null);

  constructor() {
    void this.facade.refreshCurrentUser();
  }

  async onResendVerification(): Promise<void> {
    this.successMessage.set(null);
    const sent = await this.facade.sendEmailVerification();
    if (sent) {
      this.successMessage.set("Email de vérification renvoyé.");
    }
  }

  async onSignOut(): Promise<void> {
    this.successMessage.set(null);
    const ok = await this.facade.signOut();
    if (ok) {
      this.successMessage.set('Déconnexion effectuée.');
    }
  }
}
