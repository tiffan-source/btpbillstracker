import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

export interface ClientFormModel {
  [key: string]: AbstractControl;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
}

export type ClientFormValue = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export class ClientForm extends FormGroup<ClientFormModel> {
  constructor(initial?: Partial<ClientFormValue>) {
    super({
      firstName: new FormControl(initial?.firstName ?? '', { nonNullable: true, validators: [Validators.required] }),
      lastName: new FormControl(initial?.lastName ?? '', { nonNullable: true, validators: [Validators.required] }),
      email: new FormControl(initial?.email ?? '', { nonNullable: true, validators: [Validators.email] }),
      phone: new FormControl(initial?.phone ?? '', { nonNullable: true })
    });
  }

  getPayload(): ClientFormValue {
    return this.getRawValue();
  }
}
