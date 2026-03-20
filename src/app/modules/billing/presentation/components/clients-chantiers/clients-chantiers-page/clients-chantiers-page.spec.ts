import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientsChantiersPage } from './clients-chantiers-page';

describe('ClientsChantiersPage', () => {
  let fixture: ComponentFixture<ClientsChantiersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsChantiersPage]
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
