import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthSessionFacade } from '../services/auth-session.facade';

@Component({
  selector: 'app-verify-email-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="bg-background text-foreground min-h-screen p-6">
      <h1 class="text-2xl font-semibold">Vérification email</h1>
      <p class="mt-2 text-sm text-foreground-muted">
        Vérifie ton email avant d'accéder aux actions d'écriture.
      </p>
      <button
        type="button"
        class="bg-primary text-primary-content hover:bg-primary-hover rounded-btn mt-4 px-4 py-2"
        [disabled]="facade.isSubmitting()"
        (click)="onResendVerification()"
      >
        Renvoyer l'email de vérification
      </button>
      @if (facade.error()) {
        <p class="mt-3 text-sm text-foreground-muted">{{ facade.error() }}</p>
      }
    </main>
  `
})
export class VerifyEmailPageComponent {
  readonly facade = inject(AuthSessionFacade);

  async onResendVerification(): Promise<void> {
    await this.facade.sendEmailVerification();
  }
}
