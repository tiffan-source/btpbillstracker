import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

export interface ChantierFormModel {
  [key: string]: AbstractControl;
  name: FormControl<string>;
}

export type ChantierFormValue = {
  name: string;
};

export class ChantierForm extends FormGroup<ChantierFormModel> {
  constructor(initial?: Partial<ChantierFormValue>) {
    super({
      name: new FormControl(initial?.name ?? '', { nonNullable: true, validators: [Validators.required] })
    });
  }

  getPayload(): ChantierFormValue {
    return this.getRawValue();
  }
}
