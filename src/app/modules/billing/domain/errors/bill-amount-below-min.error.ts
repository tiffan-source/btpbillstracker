import { CoreError } from '../../../../core/errors/core.error';
import { BILL_VALIDATION_MESSAGES } from '../values/bill.constraints';

export class BillAmountBelowMinError extends CoreError {
  constructor() {
    super('BILL_AMOUNT_BELOW_MIN', BILL_VALIDATION_MESSAGES.AMOUNT_MIN);
  }
}

