import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { DashboardPageComponent } from './dashboard-page.component';
import { DashboardFacade } from '../../services/dashboard.facade';

const mockDashboardFacade = {
  kpis: signal({
    totalOverdueAmount: 156,
    overdueInvoices: 2,
    toCollectThisMonth: 480,
    inProgressInvoices: 3
  }),
  invoices: signal([]),
  urgentInvoices: signal([
    {
      id: 'u-1',
      client: 'Marie Lambert',
      showsIncompleteClientIndicator: false,
      chantier: 'Cadjehoun',
      amountTTC: 156,
      dueDate: '2026-03-19',
      status: 'EN_RETARD' as const,
      nextReminder: '—',
      overdueDays: 1
    }
  ]),
  markAsPaid: vitest.fn(),
  isEditModalOpen: signal(false),
  isEditSubmitting: signal(false),
  editError: signal<string | null>(null),
  editSuccess: signal(false),
  clients: signal([{ id: 'client-1', name: 'Marie Lambert' }]),
  openEditInvoice: vitest.fn(async () => ({
    id: 'b-1',
    reference: 'F-2026-0100',
    clientId: 'client-1',
    chantier: 'Cadjehoun',
    amountTTC: 156,
    dueDate: '2026-03-19',
    invoiceNumber: 'EXT-1',
    type: 'Situation',
    paymentMode: 'Chèque',
    status: 'PAID',
    remindersAutoEnabled: true,
    reminderScenarioId: 'standard-reminder-scenario'
  })),
  closeEditModal: vitest.fn(),
  submitEditedInvoice: vitest.fn(async () => {})
};

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [provideRouter([]), { provide: DashboardFacade, useValue: mockDashboardFacade }]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render page header and actions', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Tableau de bord');
    expect(host.textContent).toContain("Vue d'ensemble de vos factures et relances");
    expect(host.textContent).toContain('Ajouter une facture');
    expect(host.textContent).toContain('Planning');
  });

  it('should render four kpi cards', () => {
    const host = fixture.nativeElement as HTMLElement;
    const cards = host.querySelectorAll('app-kpi-card');

    expect(cards.length).toBe(4);
    expect(host.textContent).toContain('Total en retard');
    expect(host.textContent).toContain('Factures en retard');
    expect(host.textContent).toContain('À encaisser ce mois');
    expect(host.textContent).toContain('Factures en cours');
  });

  it('should render urgent invoices section', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Factures les plus urgentes');
    expect(host.textContent).toContain('Marie Lambert');
    expect(host.textContent).toContain('Cadjehoun');
    expect(host.textContent).toContain('156 €');
    expect(host.textContent).toContain('1j de retard');
  });

  it('should render invoice table section', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Toutes les factures');
    expect(host.textContent).toContain('Prochaine relance');
    expect(host.textContent).toContain('Actions');
  });

  it('should compose dashboard modules in order', () => {
    const host = fixture.nativeElement as HTMLElement;
    const kpiSection = host.querySelectorAll('app-kpi-card');
    const urgentSection = host.querySelector('h2');
    const tableSection = host.querySelector('app-invoice-table');

    expect(kpiSection.length).toBe(4);
    expect(urgentSection?.textContent).toContain('Factures les plus urgentes');
    expect(tableSection).toBeTruthy();
  });

  it('should delegate quick paid action to facade', () => {
    component.markPaid('invoice-123');

    expect(mockDashboardFacade.markAsPaid).toHaveBeenCalledWith('invoice-123');
  });

  it('should open edit modal flow and hydrate edit form from facade', async () => {
    await component.editInvoice('b-1');

    expect(mockDashboardFacade.openEditInvoice).toHaveBeenCalledWith('b-1');
    expect(component.editForm.controls.id.value).toBe('b-1');
    expect(component.editForm.controls.invoiceNumber.value).toBe('EXT-1');
  });

  it('should wire modal save and close actions to facade orchestration', async () => {
    await component.saveEditInvoice();
    component.closeEditModal();

    expect(mockDashboardFacade.submitEditedInvoice).toHaveBeenCalled();
    expect(mockDashboardFacade.closeEditModal).toHaveBeenCalled();
  });
});
