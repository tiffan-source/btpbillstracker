import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
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
      clientId: new FormControl('', { nonNullable: true }),
      newClientName: new FormControl('', { nonNullable: true }),
      chantier: new FormControl('', { nonNullable: true }),
      amountTTC: new FormControl<number | null>(null),
      dueDate: new FormControl('', { nonNullable: true }),
      invoiceNumber: new FormControl('', { nonNullable: true }),
      type: new FormControl('Situation', { nonNullable: true }),
      paymentMode: new FormControl('Virement', { nonNullable: true }),
      pdfFile: new FormControl<BillPdfMemoryFile | null>(null)
    });
  }

  getPayload(): NewBillFormValue {
    return this.getRawValue();
  }
}
