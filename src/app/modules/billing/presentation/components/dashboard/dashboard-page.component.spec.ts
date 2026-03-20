import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [provideRouter([])]
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
});
