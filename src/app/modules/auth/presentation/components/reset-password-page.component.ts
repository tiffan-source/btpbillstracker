import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-reset-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<main class="p-6"><h1 class="text-2xl font-semibold">Mot de passe oublié</h1></main>`
})
export class ResetPasswordPageComponent {}
