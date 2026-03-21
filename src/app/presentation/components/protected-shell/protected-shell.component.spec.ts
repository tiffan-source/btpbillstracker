import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProtectedShellComponent } from './protected-shell.component';

describe('ProtectedShellComponent', () => {
  let fixture: ComponentFixture<ProtectedShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtectedShellComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ProtectedShellComponent);
    fixture.detectChanges();
  });

  it('renders sidebar branding and app version', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('RelanceBTP');
    expect(host.textContent).toContain('Suivi de factures');
    expect(host.textContent).toContain('RelanceBTP v1.0');
  });

  it('renders all requested navigation entries', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Tableau de bord');
    expect(host.textContent).toContain('Ajouter une facture');
    expect(host.textContent).toContain('Planning relances');
    expect(host.textContent).toContain('Modèles de messages');
    expect(host.textContent).toContain('Clients & Chantiers');
  });
});
