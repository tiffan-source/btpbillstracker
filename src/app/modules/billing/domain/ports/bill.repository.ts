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

  /**
   * Mettre à jour une facture persistée.
   * @throws {BillNotFoundError} Quand la facture n'existe pas.
   * @throws {BillPersistenceError} Quand la persistance échoue.
   */
  abstract update(bill: Bill): Promise<void>;
}
