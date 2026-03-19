import { Bill } from '../entities/bill.entity';

export abstract class BillRepository {
  abstract save(bill: Bill): Promise<void>;
}
