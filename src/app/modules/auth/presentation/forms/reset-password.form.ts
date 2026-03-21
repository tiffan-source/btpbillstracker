import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

export interface ResetPasswordFormModel {
  [key: string]: AbstractControl;
  email: FormControl<string>;
}

export class ResetPasswordForm extends FormGroup<ResetPasswordFormModel> {
  constructor() {
    super({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      })
    });
  }

  getPayload(): { email: string } {
    return this.getRawValue();
  }
}
