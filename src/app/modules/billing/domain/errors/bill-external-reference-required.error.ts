import { CoreError } from '../../../../core/errors/core.error';
import { BILL_VALIDATION_MESSAGES } from '../values/bill.constraints';

export class BillExternalReferenceRequiredError extends CoreError {
  constructor() {
    super('BILL_EXTERNAL_REFERENCE_REQUIRED', BILL_VALIDATION_MESSAGES.EXTERNAL_REFERENCE_REQUIRED);
  }
}

