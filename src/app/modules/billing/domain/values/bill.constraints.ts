export const BILL_MIN_AMOUNT_TTC = 0;

export const BILL_TYPES = ['Situation', 'Solde', 'Acompte'] as const;
export type BillType = (typeof BILL_TYPES)[number];

export const PAYMENT_MODES = ['Virement', 'Chèque', 'Espèces'] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const BILL_VALIDATION_MESSAGES = {
  INVALID_REFERENCE: 'Une facture doit avoir une référence valide.',
  CLIENT_REQUIRED: 'Une facture doit être associée à un client.',
  AMOUNT_MIN: 'Le montant TTC doit être supérieur ou égal à 0.',
  DUE_DATE_REQUIRED: "La date d'échéance est obligatoire.",
  EXTERNAL_REFERENCE_REQUIRED: 'La référence facture externe est obligatoire.',
  TYPE_INVALID: "Le type de facture est invalide. Valeurs autorisées: Situation, Solde, Acompte.",
  PAYMENT_MODE_INVALID: 'Le mode de paiement est invalide. Valeurs autorisées: Virement, Chèque, Espèces.'
} as const;

export function isBillType(value: string): value is BillType {
  return BILL_TYPES.includes(value as BillType);
}

export function isPaymentMode(value: string): value is PaymentMode {
  return PAYMENT_MODES.includes(value as PaymentMode);
}
