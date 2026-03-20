import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ClientsChantiersPage } from './clients-chantiers-page';
import { ClientsChantiersFacade } from '../../../services/clients-chantiers.facade';

const mockFacade = {
  clients: signal([
    {
      id: 'c-1',
      fullName: 'Alice Martin',
      email: 'alice@example.com',
      phone: '+2290100000000',
      invoiceCount: 2,
      totalDue: 300,
      paid: 120,
      firstName: 'Alice',
      lastName: 'Martin'
    }
  ]),
  isSubmitting: signal(false),
  error: signal<string | null>(null),
  loadClients: vitest.fn().mockResolvedValue(undefined),
  updateClient: vitest.fn().mockResolvedValue(true)
};

describe('ClientsChantiersPage', () => {
  let fixture: ComponentFixture<ClientsChantiersPage>;

  beforeEach(async () => {
    mockFacade.clients.set([
      {
        id: 'c-1',
        fullName: 'Alice Martin',
        email: 'alice@example.com',
        phone: '+2290100000000',
        invoiceCount: 2,
        totalDue: 300,
        paid: 120,
        firstName: 'Alice',
        lastName: 'Martin'
      }
    ]);

    await TestBed.configureTestingModule({
      imports: [ClientsChantiersPage],
      providers: [{ provide: ClientsChantiersFacade, useValue: mockFacade }]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsChantiersPage);
    fixture.detectChanges();
  });

  it('renders the page title and subtitle', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Clients & Chantiers');
    expect(host.textContent).toContain('Vue par client et par chantier');
  });

  it('renders client and chantier sections', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Par client');
    expect(host.textContent).toContain('Par chantier');
  });

  it('renders a client management list placeholder for cards', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('[data-testid="client-list"]')).toBeTruthy();
    expect(host.querySelectorAll('[data-testid="client-card"]').length).toBe(1);
  });

  it('uses semantic design token classes for global sections', () => {
    const host = fixture.nativeElement as HTMLElement;
    const page = host.querySelector('div.min-h-screen');
    const cards = host.querySelectorAll('section');

    expect(page?.className).toContain('bg-background');
    expect(cards.length).toBe(2);
    cards.forEach((section) => {
      expect(section.className).toContain('bg-surface');
      expect(section.className).toContain('rounded-card');
      expect(section.className).toContain('border-subtle');
    });
  });
});
