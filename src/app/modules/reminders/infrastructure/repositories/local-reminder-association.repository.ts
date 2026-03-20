import { Injectable } from '@angular/core';
import { ReminderAssociation } from '../../domain/entities/reminder-association.entity';
import { ReminderPersistenceError } from '../../domain/errors/reminder-persistence.error';
import { ReminderAssociationRepository } from '../../domain/ports/reminder-association.repository';

@Injectable({ providedIn: 'root' })
export class LocalReminderAssociationRepository extends ReminderAssociationRepository {
  private readonly storageKey = 'btp_bill_reminder_associations';

  async save(association: ReminderAssociation): Promise<void> {
    try {
      const rawData = localStorage.getItem(this.storageKey);
      const items = rawData
        ? (JSON.parse(rawData) as Array<{ billId: string; reminderScenarioId: string }>)
        : [];

      const filtered = items.filter((item) => item.billId !== association.billId);
      filtered.push({ billId: association.billId, reminderScenarioId: association.reminderScenarioId });

      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error: unknown) {
      throw new ReminderPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }

  async findByBillId(billId: string): Promise<ReminderAssociation | null> {
    try {
      const rawData = localStorage.getItem(this.storageKey);

      if (!rawData) {
        return null;
      }

      const items = JSON.parse(rawData) as Array<{ billId: string; reminderScenarioId: string }>;
      const item = items.find((entry) => entry.billId === billId);

      if (!item) {
        return null;
      }

      return new ReminderAssociation(item.billId, item.reminderScenarioId);
    } catch (error: unknown) {
      throw new ReminderPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }
}
