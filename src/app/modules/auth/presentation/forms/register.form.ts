import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

export interface RegisterFormModel {
  [key: string]: AbstractControl;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

export class RegisterForm extends FormGroup<RegisterFormModel> {
  constructor() {
    super({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)]
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)]
      })
    });
  }

  passwordsMatch(): boolean {
    return this.controls.password.value === this.controls.confirmPassword.value;
  }

  getPayload(): { email: string; password: string } {
    return {
      email: this.controls.email.value,
      password: this.controls.password.value
    };
  }
}
