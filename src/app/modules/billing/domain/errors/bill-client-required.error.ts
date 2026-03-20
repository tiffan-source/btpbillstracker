import { CoreError } from '../../../../core/errors/core.error';
import { BILL_VALIDATION_MESSAGES } from '../values/bill.constraints';

export class BillClientRequiredError extends CoreError {
  constructor() {
    super('BILL_CLIENT_REQUIRED', BILL_VALIDATION_MESSAGES.CLIENT_REQUIRED);
  }
}

