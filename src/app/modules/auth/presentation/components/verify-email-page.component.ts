import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-verify-email-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<main class="p-6"><h1 class="text-2xl font-semibold">Vérification email</h1></main>`
})
export class VerifyEmailPageComponent {}
