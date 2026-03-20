import { Bill } from '../entities/bill.entity';

export abstract class BillRepository {
  /**
   * Persister une facture.
   * @throws {BillPersistenceError} Quand la persistance échoue.
   */
  abstract save(bill: Bill): Promise<void>;

  /**
   * Lister les factures persistées.
   * @throws {BillPersistenceError} Quand la lecture échoue.
   */
  abstract list(): Promise<Bill[]>;
}
