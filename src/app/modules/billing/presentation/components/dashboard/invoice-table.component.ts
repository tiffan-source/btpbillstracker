import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DashboardInvoiceViewModel } from '../../services/dashboard.facade';

@Component({
  selector: 'app-invoice-table',
  templateUrl: './invoice-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceTableComponent {
  readonly invoices = input.required<DashboardInvoiceViewModel[]>();
  readonly markPaid = output<string>();
  readonly editInvoice = output<string>();

  onMarkPaid(id: string): void {
    this.markPaid.emit(id);
  }

  onEdit(id: string): void {
    this.editInvoice.emit(id);
  }
}

