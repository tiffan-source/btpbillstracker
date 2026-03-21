import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthSessionFacade } from '../services/auth-session.facade';
import { ResetPasswordForm } from '../forms/reset-password.form';

@Component({
  selector: 'app-reset-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <main class="bg-background text-foreground min-h-screen p-6">
      <h1 class="text-2xl font-semibold">Mot de passe oublié</h1>
      <form class="mt-6 flex max-w-md flex-col gap-3" [formGroup]="form" (ngSubmit)="onSubmit()">
        <label for="reset-email" class="text-sm text-foreground-muted">Email</label>
        <input
          id="reset-email"
          type="email"
          class="border-input rounded-input border px-3 py-2"
          formControlName="email"
        />
        <button
          type="submit"
          class="bg-primary text-primary-content hover:bg-primary-hover rounded-btn px-4 py-2"
          [disabled]="facade.isSubmitting()"
        >
          Envoyer le lien
        </button>
      </form>
      @if (successMessage()) {
        <p class="mt-3 text-sm text-foreground-muted">{{ successMessage() }}</p>
      }
      @if (facade.error()) {
        <p class="mt-2 text-sm text-foreground-muted">{{ facade.error() }}</p>
      }
    </main>
  `
})
export class ResetPasswordPageComponent {
  readonly facade = inject(AuthSessionFacade);
  readonly form = new ResetPasswordForm();
  readonly successMessage = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    this.successMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const sent = await this.facade.requestPasswordReset(this.form.getPayload().email);
    if (sent) {
      this.successMessage.set('Si votre compte existe, un email de réinitialisation a été envoyé.');
    }
  }
}
