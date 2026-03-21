import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterForm } from '../forms/register.form';
import { AuthSessionFacade } from '../services/auth-session.facade';

@Component({
  selector: 'app-register-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <main class="bg-background text-foreground min-h-screen p-6">
      <h1 class="text-2xl font-semibold">Inscription</h1>
      <form class="mt-6 flex max-w-md flex-col gap-3" [formGroup]="form" (ngSubmit)="onSubmit()">
        <label for="register-email" class="text-sm text-foreground-muted">Email</label>
        <input
          id="register-email"
          type="email"
          class="border-input rounded-input border px-3 py-2"
          formControlName="email"
        />
        <label for="register-password" class="text-sm text-foreground-muted">Mot de passe</label>
        <input
          id="register-password"
          type="password"
          class="border-input rounded-input border px-3 py-2"
          formControlName="password"
        />
        <label for="register-confirm-password" class="text-sm text-foreground-muted">Confirmer le mot de passe</label>
        <input
          id="register-confirm-password"
          type="password"
          class="border-input rounded-input border px-3 py-2"
          formControlName="confirmPassword"
        />
        <button
          type="submit"
          class="bg-primary text-primary-content hover:bg-primary-hover rounded-btn px-4 py-2"
          [disabled]="facade.isSubmitting()"
        >
          S'inscrire
        </button>
      </form>
      @if (passwordMismatch()) {
        <p class="mt-2 text-sm text-danger">Les mots de passe ne correspondent pas.</p>
      }
      @if (facade.error()) {
        <p class="mt-2 text-sm text-foreground-muted">{{ facade.error() }}</p>
      }
    </main>
  `
})
export class RegisterPageComponent {
  readonly facade = inject(AuthSessionFacade);
  readonly form = new RegisterForm();
  readonly passwordMismatch = signal(false);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly returnUrl = signal<string>('/dashboard');

  constructor() {
    this.returnUrl.set(this.resolveReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')));
  }

  async onSubmit(): Promise<void> {
    this.passwordMismatch.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.form.passwordsMatch()) {
      this.passwordMismatch.set(true);
      return;
    }

    const payload = this.form.getPayload();
    const ok = await this.facade.registerWithEmail(payload.email, payload.password);
    if (ok) {
      await this.router.navigateByUrl(this.returnUrl());
    }
  }

  private resolveReturnUrl(value: string | null): string {
    return value && value.trim().length > 0 ? value : '/dashboard';
  }
}
