import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-register-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<main class="p-6"><h1 class="text-2xl font-semibold">Inscription</h1></main>`
})
export class RegisterPageComponent {}
