import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthSessionFacade } from '../services/auth-session.facade';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="bg-background text-foreground min-h-screen p-6">
      <h1 class="text-2xl font-semibold">Connexion</h1>
      <div class="mt-6 flex gap-3">
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly returnUrl = signal<string>('/dashboard');

  constructor() {
    this.returnUrl.set(this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard');
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
