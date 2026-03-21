import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginForm } from '../forms/login.form';
import { AuthSessionFacade } from '../services/auth-session.facade';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <main class="bg-background text-foreground min-h-screen p-6">
      <h1 class="text-2xl font-semibold">Connexion</h1>
      <form class="mt-6 flex max-w-md flex-col gap-3" [formGroup]="form" (ngSubmit)="onSubmit()">
        <label for="login-email" class="text-sm text-foreground-muted">Email</label>
        <input
          id="login-email"
          type="email"
          class="border-input rounded-input border px-3 py-2"
          formControlName="email"
        />
        <label for="login-password" class="text-sm text-foreground-muted">Mot de passe</label>
        <input
          id="login-password"
          type="password"
          class="border-input rounded-input border px-3 py-2"
          formControlName="password"
        />
        <button
          type="submit"
          class="bg-primary text-primary-content hover:bg-primary-hover rounded-btn px-4 py-2"
          [disabled]="facade.isSubmitting()"
        >
          Se connecter
        </button>
      </form>
      <div class="mt-4 flex gap-3">
        <button
          type="button"
          class="bg-primary text-primary-content hover:bg-primary-hover rounded-btn px-4 py-2"
          [disabled]="facade.isSubmitting()"
          (click)="onGoogleLogin()"
        >
          Continuer avec Google
        </button>
        <button
          type="button"
          class="border-input rounded-btn border px-4 py-2"
          [disabled]="facade.isSubmitting()"
          (click)="onFacebookLogin()"
        >
          Continuer avec Facebook
        </button>
      </div>
      @if (facade.error()) {
        <p class="mt-3 text-sm text-foreground-muted">{{ facade.error() }}</p>
      }
    </main>
  `
})
export class LoginPageComponent {
  readonly facade = inject(AuthSessionFacade);
  readonly form = new LoginForm();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly returnUrl = signal<string>('/dashboard');

  constructor() {
    this.returnUrl.set(this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard');
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getPayload();
    const ok = await this.facade.loginWithEmail(payload.email, payload.password);
    if (ok) {
      await this.router.navigateByUrl(this.returnUrl());
    }
  }

  async onGoogleLogin(): Promise<void> {
    const ok = await this.facade.loginWithGoogle();
    if (ok) {
      await this.router.navigateByUrl(this.returnUrl());
    }
  }

  async onFacebookLogin(): Promise<void> {
    const ok = await this.facade.loginWithFacebook();
    if (ok) {
      await this.router.navigateByUrl(this.returnUrl());
    }
  }
}
