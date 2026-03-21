import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EditBillForm } from '../../forms/edit-bill.form';
import { DashboardFacade } from '../../services/dashboard.facade';
import { EditBillModalComponent } from './edit-bill-modal.component';
import { KpiCardComponent } from './kpi-card.component';
import { InvoiceTableComponent } from './invoice-table.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, KpiCardComponent, InvoiceTableComponent, EditBillModalComponent],
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  readonly facade = inject(DashboardFacade);
  readonly editForm = new EditBillForm();

  markPaid(id: string): void {
    this.facade.markAsPaid(id);
  }

  async editInvoice(id: string): Promise<void> {
    const editable = await this.facade.openEditInvoice(id);
    if (!editable) {
      return;
    }

    this.editForm.reset(editable);
    this.editForm.setClientMode(false);
    this.editForm.setChantierMode(editable.shouldCreateChantier);
    this.editForm.setRemindersAutoEnabled(editable.remindersAutoEnabled);
  }

  closeEditModal(): void {
    this.facade.closeEditModal();
  }

  async saveEditInvoice(): Promise<void> {
    await this.facade.submitEditedInvoice(this.editForm.getPayload());
  }

  async useExistingChantierForEdit(): Promise<void> {
    await this.facade.confirmUseExistingChantierForEdit();
  }

  async createNewChantierForEdit(): Promise<void> {
    await this.facade.confirmCreateNewChantierForEdit();
  }

  closeDuplicateChantierPromptForEdit(): void {
    this.facade.dismissDuplicateChantierPromptForEdit();
  }
}
