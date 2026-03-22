import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BillStatus } from '../../domain/entities/bill.entity';
import { BILL_MIN_AMOUNT_TTC, BILL_TYPES, PAYMENT_MODES } from '../../domain/values/bill.constraints';
import { STANDARD_REMINDER_SCENARIO_ID } from '../../../reminders/domain/values/reminder.constants';

export interface EditBillFormModel {
  [key: string]: AbstractControl;
  id: FormControl<string>;
  reference: FormControl<string>;
  clientId: FormControl<string>;
  newClientName: FormControl<string>;
  chantierId: FormControl<string>;
  chantierName: FormControl<string>;
  shouldCreateChantier: FormControl<boolean>;
  amountTTC: FormControl<number | null>;
  dueDate: FormControl<string>;
  invoiceNumber: FormControl<string>;
  type: FormControl<string>;
  paymentMode: FormControl<string>;
  status: FormControl<BillStatus>;
  remindersAutoEnabled: FormControl<boolean>;
  reminderScenarioId: FormControl<string>;
}

export type EditBillFormValue = {
  id: string;
  reference: string;
  clientId: string;
  newClientName: string;
  chantierId: string;
  chantierName: string;
  shouldCreateChantier: boolean;
  amountTTC: number | null;
  dueDate: string;
  invoiceNumber: string;
  type: string;
  paymentMode: string;
  status: BillStatus;
  remindersAutoEnabled: boolean;
  reminderScenarioId: string;
};

export class EditBillForm extends FormGroup<EditBillFormModel> {
  constructor() {
    super({
      id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      reference: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      clientId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      newClientName: new FormControl('', { nonNullable: true }),
      chantierId: new FormControl('', { nonNullable: true }),
      chantierName: new FormControl('', { nonNullable: true }),
      shouldCreateChantier: new FormControl(false, { nonNullable: true }),
      amountTTC: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(BILL_MIN_AMOUNT_TTC)]
      }),
      dueDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      invoiceNumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      type: new FormControl(BILL_TYPES[0], { nonNullable: true, validators: [Validators.required] }),
      paymentMode: new FormControl(PAYMENT_MODES[0], { nonNullable: true, validators: [Validators.required] }),
      status: new FormControl<BillStatus>('VALIDATED', { nonNullable: true, validators: [Validators.required] }),
      remindersAutoEnabled: new FormControl(true, { nonNullable: true }),
      reminderScenarioId: new FormControl(STANDARD_REMINDER_SCENARIO_ID, {
        nonNullable: true,
        validators: [Validators.required]
      })
    });
  }

  setClientMode(isNewClientMode: boolean): void {
    if (isNewClientMode) {
      this.controls.clientId.setValue('');
      this.controls.clientId.clearValidators();
      this.controls.newClientName.setValidators([Validators.required]);
    } else {
      this.controls.newClientName.setValue('');
      this.controls.clientId.setValidators([Validators.required]);
      this.controls.newClientName.clearValidators();
    }

    this.controls.clientId.updateValueAndValidity({ emitEvent: false });
    this.controls.newClientName.updateValueAndValidity({ emitEvent: false });
  }

  setRemindersAutoEnabled(isEnabled: boolean): void {
    this.controls.remindersAutoEnabled.setValue(isEnabled);

    if (isEnabled) {
      this.controls.reminderScenarioId.setValidators([Validators.required]);
      if (!this.controls.reminderScenarioId.value) {
        this.controls.reminderScenarioId.setValue(STANDARD_REMINDER_SCENARIO_ID);
      }
    } else {
      this.controls.reminderScenarioId.clearValidators();
      this.controls.reminderScenarioId.setValue('');
    }

    this.controls.reminderScenarioId.updateValueAndValidity({ emitEvent: false });
  }

  setChantierMode(isCreatingNewChantier: boolean): void {
    this.controls.shouldCreateChantier.setValue(isCreatingNewChantier);
    if (isCreatingNewChantier) {
      this.controls.chantierId.clearValidators();
      this.controls.chantierName.setValidators([Validators.required]);
    } else {
      this.controls.chantierId.clearValidators();
      this.controls.chantierName.clearValidators();
    }

    this.controls.chantierId.updateValueAndValidity({ emitEvent: false });
    this.controls.chantierName.updateValueAndValidity({ emitEvent: false });
  }

  getErrorMessage(controlName: keyof EditBillFormModel): string | null {
    const control = this.controls[controlName];

    if (!control?.errors) {
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
        case 'chantierName':
          return 'Le nom du nouveau chantier est obligatoire.';
        case 'dueDate':
          return "La date d'échéance est obligatoire.";
        case 'invoiceNumber':
          return 'La référence facture est obligatoire.';
        case 'type':
          return 'Le type de facture est obligatoire.';
        case 'paymentMode':
          return 'Le mode de paiement est obligatoire.';
        case 'status':
          return 'Le statut est obligatoire.';
        case 'reminderScenarioId':
          return 'Le scénario de relance est obligatoire lorsque les relances automatiques sont activées.';
        default:
          return 'Ce champ est obligatoire.';
      }
    }

    if (control.errors['min'] && controlName === 'amountTTC') {
      return 'Le montant TTC doit être supérieur ou égal à 0.';
    }

    return 'La valeur saisie est invalide.';
  }

  getPayload(): EditBillFormValue {
    return this.getRawValue();
  }
}
