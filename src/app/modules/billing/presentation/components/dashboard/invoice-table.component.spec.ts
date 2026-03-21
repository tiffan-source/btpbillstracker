import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceTableComponent } from './invoice-table.component';
import { DashboardInvoiceViewModel } from '../../services/dashboard.facade';

describe('InvoiceTableComponent', () => {
  let fixture: ComponentFixture<InvoiceTableComponent>;
  let component: InvoiceTableComponent;

  const invoices: DashboardInvoiceViewModel[] = [
    {
      id: 'i-1',
      client: 'Marie Lambert',
      showsIncompleteClientIndicator: false,
      chantier: 'Cadjehoun',
      amountTTC: 156,
      dueDate: '2026-03-19',
      status: 'EN_RETARD',
      nextReminder: '—',
      overdueDays: 1
    },
    {
      id: 'i-2',
      client: 'Client inconnu',
      showsIncompleteClientIndicator: true,
      chantier: 'Akpakpa',
      amountTTC: 480,
      dueDate: '2026-03-28',
      status: 'PAYE',
      nextReminder: '—',
      overdueDays: 0
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('invoices', invoices);
    fixture.detectChanges();
  });

  it('should render required table headers', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Client');
    expect(host.textContent).toContain('Chantier');
    expect(host.textContent).toContain('Montant');
    expect(host.textContent).toContain('Échéance');
    expect(host.textContent).toContain('Statut');
    expect(host.textContent).toContain('Prochaine relance');
    expect(host.textContent).toContain('Actions');
  });

  it('should render overdue suffix and relance placeholder', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('+1j');
    expect(host.textContent).toContain('—');
  });

  it('should show quick Payé action only for non-paid invoices', () => {
    const host = fixture.nativeElement as HTMLElement;
    const quickPaidButtons = host.querySelectorAll('button');
    const paidLabeled = Array.from(quickPaidButtons).filter((button) => button.textContent?.includes('Payé'));

    expect(paidLabeled.length).toBe(1);
  });

  it('shows incomplete indicator for fallback client labels', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Client incomplet');
  });
});
