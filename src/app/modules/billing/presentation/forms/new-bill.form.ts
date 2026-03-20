import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BillPdfMemoryFile } from '../stores/bill.store';

export interface NewBillFormModel {
  [key: string]: AbstractControl;
  clientId: FormControl<string>;
  newClientName: FormControl<string>;
  chantier: FormControl<string>;
  amountTTC: FormControl<number | null>;
  dueDate: FormControl<string>;
  invoiceNumber: FormControl<string>;
  type: FormControl<string>;
  paymentMode: FormControl<string>;
  pdfFile: FormControl<BillPdfMemoryFile | null>;
}

export type NewBillFormValue = {
  clientId: string;
  newClientName: string;
  chantier: string;
  amountTTC: number | null;
  dueDate: string;
  invoiceNumber: string;
  type: string;
  paymentMode: string;
  pdfFile: BillPdfMemoryFile | null;
};

export class NewBillForm extends FormGroup<NewBillFormModel> {
  constructor() {
    super({
      clientId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      newClientName: new FormControl('', { nonNullable: true }),
      chantier: new FormControl('', { nonNullable: true }),
      amountTTC: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
      dueDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      invoiceNumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      type: new FormControl('Situation', { nonNullable: true, validators: [Validators.required] }),
      paymentMode: new FormControl('Virement', { nonNullable: true, validators: [Validators.required] }),
      pdfFile: new FormControl<BillPdfMemoryFile | null>(null)
    });
  }

  setClientMode(isNewClientMode: boolean): void {
    if (isNewClientMode) {
      this.controls.clientId.clearValidators();
      this.controls.newClientName.setValidators([Validators.required]);
    } else {
      this.controls.clientId.setValidators([Validators.required]);
      this.controls.newClientName.clearValidators();
    }

    this.controls.clientId.updateValueAndValidity({ emitEvent: false });
    this.controls.newClientName.updateValueAndValidity({ emitEvent: false });
  }

  getErrorMessage(controlName: keyof NewBillFormModel): string | null {
    const control = this.controls[controlName];

    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      switch (controlName) {
        case 'clientId':
          return 'Le client est obligatoire.';
        case 'newClientName':
          return 'Le nom du nouveau client est obligatoire.';
        case 'amountTTC':
          return 'Le montant TTC est obligatoire.';
        case 'dueDate':
          return "La date d'échéance est obligatoire.";
        case 'invoiceNumber':
          return 'La référence facture est obligatoire.';
        case 'type':
          return 'Le type de facture est obligatoire.';
        case 'paymentMode':
          return 'Le mode de paiement est obligatoire.';
        default:
          return 'Ce champ est obligatoire.';
      }
    }

    if (control.errors['min'] && controlName === 'amountTTC') {
      return 'Le montant TTC doit être supérieur ou égal à 0.';
    }

    return 'La valeur saisie est invalide.';
  }

  getPayload(): NewBillFormValue {
    return this.getRawValue();
  }
}
