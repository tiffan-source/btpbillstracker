import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

export interface LoginFormModel {
  [key: string]: AbstractControl;
  email: FormControl<string>;
  password: FormControl<string>;
}

export class LoginForm extends FormGroup<LoginFormModel> {
  constructor() {
    super({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)]
      })
    });
  }

  getPayload(): { email: string; password: string } {
    return this.getRawValue();
  }
}
