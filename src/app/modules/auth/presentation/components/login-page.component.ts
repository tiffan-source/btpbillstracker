import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<main class="p-6"><h1 class="text-2xl font-semibold">Connexion</h1></main>`
})
export class LoginPageComponent {}
