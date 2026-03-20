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
      chantier: 'Cadjehoun',
      amountTTC: 156,
      dueDate: '2026-03-19',
      status: 'EN_RETARD' as const,
      nextReminder: '—',
      overdueDays: 1
    }
  ]),
  markAsPaid: vitest.fn()
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
});
