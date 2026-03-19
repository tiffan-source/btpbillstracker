export type BillStatus = 'DRAFT' | 'VALIDATED' | 'PAID';
export type BillType = 'Situation' | 'Solde' | 'Acompte';
export type PaymentMode = 'Virement' | 'Chèque' | 'Espèces';

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
      throw new Error('Une facture doit avoir une référence valide.');
    }
    if (!clientId || clientId.trim().length === 0) {
      throw new Error('Une facture doit être associée à un client.');
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
    if (amountTTC < 0) {
      throw new Error('Le montant TTC doit être supérieur ou égal à 0.');
    }
    this._amountTTC = amountTTC;
    return this;
  }

  setDueDate(dueDate: string): this {
    if (!dueDate || dueDate.trim().length === 0) {
      throw new Error("La date d'échéance est obligatoire.");
    }
    this._dueDate = dueDate;
    return this;
  }

  setExternalInvoiceReference(externalInvoiceReference: string): this {
    if (!externalInvoiceReference || externalInvoiceReference.trim().length === 0) {
      throw new Error('La référence facture externe est obligatoire.');
    }
    this._externalInvoiceReference = externalInvoiceReference;
    return this;
  }

  setType(type: string): this {
    if (!isBillType(type)) {
      throw new Error("Le type de facture est invalide. Valeurs autorisées: Situation, Solde, Acompte.");
    }
    this._type = type;
    return this;
  }

  setPaymentMode(paymentMode: string): this {
    if (!isPaymentMode(paymentMode)) {
      throw new Error('Le mode de paiement est invalide. Valeurs autorisées: Virement, Chèque, Espèces.');
    }
    this._paymentMode = paymentMode;
    return this;
  }
}

function isBillType(value: string): value is BillType {
  return value === 'Situation' || value === 'Solde' || value === 'Acompte';
}

function isPaymentMode(value: string): value is PaymentMode {
  return value === 'Virement' || value === 'Chèque' || value === 'Espèces';
}
