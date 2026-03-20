import { CoreError } from '../../../../core/errors/core.error';
import { BILL_VALIDATION_MESSAGES } from '../values/bill.constraints';

export class BillDueDateRequiredError extends CoreError {
  constructor() {
    super('BILL_DUE_DATE_REQUIRED', BILL_VALIDATION_MESSAGES.DUE_DATE_REQUIRED);
  }
}

