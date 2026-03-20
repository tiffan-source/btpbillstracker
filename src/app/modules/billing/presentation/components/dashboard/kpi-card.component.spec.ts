import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';

describe('KpiCardComponent', () => {
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    fixture.componentRef.setInput('title', 'Total en retard');
    fixture.componentRef.setInput('value', '156 €');
    fixture.componentRef.setInput('icon', '!');
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();
  });

  it('should render title and value', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Total en retard');
    expect(host.textContent).toContain('156 €');
  });
});

