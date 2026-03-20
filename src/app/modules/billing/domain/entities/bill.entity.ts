export type BillStatus = 'DRAFT' | 'VALIDATED' | 'PAID';
import {
  BILL_MIN_AMOUNT_TTC,
  BillType,
  PaymentMode,
  isBillType,
  isPaymentMode
} from '../values/bill.constraints';
import { BillAmountBelowMinError } from '../errors/bill-amount-below-min.error';
import { BillClientRequiredError } from '../errors/bill-client-required.error';
import { BillDueDateRequiredError } from '../errors/bill-due-date-required.error';
import { BillExternalReferenceRequiredError } from '../errors/bill-external-reference-required.error';
import { InvalidBillReferenceError } from '../errors/invalid-bill-reference.error';
import { InvalidBillTypeError } from '../errors/invalid-bill-type.error';
import { InvalidPaymentModeError } from '../errors/invalid-payment-mode.error';
import { ReminderScenarioRequiredError } from '../errors/reminder-scenario-required.error';

export class Bill {
  private readonly _id: string;
  private readonly _reference: string;
  private readonly _clientId: string;
  private _status: BillStatus = 'DRAFT';
  private _amountTTC?: number;
  private _dueDate?: string;
  private _externalInvoiceReference?: string;
  private _type?: BillType;
  private _paymentMode?: PaymentMode;
  private _chantier?: string;
  private _remindersAutoEnabled = false;
  private _reminderScenarioId?: string;

  constructor(id: string, reference: string, clientId: string) {
    if (!reference || reference.trim().length === 0) {
      throw new InvalidBillReferenceError();
    }
    if (!clientId || clientId.trim().length === 0) {
      throw new BillClientRequiredError();
    }

    this._id = id;
    this._reference = reference;
    this._clientId = clientId;
  }

  get id(): string { return this._id; }
  get reference(): string { return this._reference; }
  get clientId(): string { return this._clientId; }
  get status(): BillStatus { return this._status; }
  get amountTTC(): number | undefined { return this._amountTTC; }
  get dueDate(): string | undefined { return this._dueDate; }
  get externalInvoiceReference(): string | undefined { return this._externalInvoiceReference; }
  get type(): BillType | undefined { return this._type; }
  get paymentMode(): PaymentMode | undefined { return this._paymentMode; }
  get chantier(): string | undefined { return this._chantier; }
  get remindersAutoEnabled(): boolean { return this._remindersAutoEnabled; }
  get reminderScenarioId(): string | undefined { return this._reminderScenarioId; }

  setAmountTTC(amountTTC: number): this {
    if (amountTTC < BILL_MIN_AMOUNT_TTC) {
      throw new BillAmountBelowMinError();
    }
    this._amountTTC = amountTTC;
    return this;
  }

  setDueDate(dueDate: string): this {
    if (!dueDate || dueDate.trim().length === 0) {
      throw new BillDueDateRequiredError();
    }
    this._dueDate = dueDate;
    return this;
  }

  setExternalInvoiceReference(externalInvoiceReference: string): this {
    if (!externalInvoiceReference || externalInvoiceReference.trim().length === 0) {
      throw new BillExternalReferenceRequiredError();
    }
    this._externalInvoiceReference = externalInvoiceReference;
    return this;
  }

  setType(type: string): this {
    if (!isBillType(type)) {
      throw new InvalidBillTypeError();
    }
    this._type = type;
    return this;
  }

  setPaymentMode(paymentMode: string): this {
    if (!isPaymentMode(paymentMode)) {
      throw new InvalidPaymentModeError();
    }
    this._paymentMode = paymentMode;
    return this;
  }

  setChantier(chantier: string): this {
    const normalized = chantier.trim();
    this._chantier = normalized.length > 0 ? normalized : undefined;
    return this;
  }

  setStatus(status: BillStatus): this {
    this._status = status;
    return this;
  }

  configureReminder(remindersAutoEnabled: boolean, reminderScenarioId?: string): this {
    this._remindersAutoEnabled = remindersAutoEnabled;

    if (!remindersAutoEnabled) {
      this._reminderScenarioId = undefined;
      return this;
    }

    if (!reminderScenarioId || reminderScenarioId.trim().length === 0) {
      throw new ReminderScenarioRequiredError();
    }

    this._reminderScenarioId = reminderScenarioId;
    return this;
  }
}
