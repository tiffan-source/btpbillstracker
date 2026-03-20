export type BillStatus = 'DRAFT' | 'VALIDATED' | 'PAID';
import {
  BILL_MIN_AMOUNT_TTC,
  BILL_VALIDATION_MESSAGES,
  BillType,
  PaymentMode,
  isBillType,
  isPaymentMode
} from '../values/bill.constraints';

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

  constructor(id: string, reference: string, clientId: string) {
    if (!reference || reference.trim().length === 0) {
      throw new Error(BILL_VALIDATION_MESSAGES.INVALID_REFERENCE);
    }
    if (!clientId || clientId.trim().length === 0) {
      throw new Error(BILL_VALIDATION_MESSAGES.CLIENT_REQUIRED);
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

  setAmountTTC(amountTTC: number): this {
    if (amountTTC < BILL_MIN_AMOUNT_TTC) {
      throw new Error(BILL_VALIDATION_MESSAGES.AMOUNT_MIN);
    }
    this._amountTTC = amountTTC;
    return this;
  }

  setDueDate(dueDate: string): this {
    if (!dueDate || dueDate.trim().length === 0) {
      throw new Error(BILL_VALIDATION_MESSAGES.DUE_DATE_REQUIRED);
    }
    this._dueDate = dueDate;
    return this;
  }

  setExternalInvoiceReference(externalInvoiceReference: string): this {
    if (!externalInvoiceReference || externalInvoiceReference.trim().length === 0) {
      throw new Error(BILL_VALIDATION_MESSAGES.EXTERNAL_REFERENCE_REQUIRED);
    }
    this._externalInvoiceReference = externalInvoiceReference;
    return this;
  }

  setType(type: string): this {
    if (!isBillType(type)) {
      throw new Error(BILL_VALIDATION_MESSAGES.TYPE_INVALID);
    }
    this._type = type;
    return this;
  }

  setPaymentMode(paymentMode: string): this {
    if (!isPaymentMode(paymentMode)) {
      throw new Error(BILL_VALIDATION_MESSAGES.PAYMENT_MODE_INVALID);
    }
    this._paymentMode = paymentMode;
    return this;
  }
}
