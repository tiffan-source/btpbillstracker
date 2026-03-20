import { ReminderAssociation } from '../entities/reminder-association.entity';

/**
 * Persister la relation entre facture et scénario de relance.
 */
export abstract class ReminderAssociationRepository {
  abstract save(association: ReminderAssociation): Promise<void>;
  abstract findByBillId(billId: string): Promise<ReminderAssociation | null>;
}
