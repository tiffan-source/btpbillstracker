export type BillStatus = 'DRAFT' | 'VALIDATED' | 'PAID';

export class Bill {
  private readonly _id: string;
  private readonly _reference: string;
  private readonly _clientId: string;
  private _status: BillStatus = 'DRAFT';

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
}
