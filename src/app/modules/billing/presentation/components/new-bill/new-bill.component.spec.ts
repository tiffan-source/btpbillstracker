import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewBillComponent } from './new-bill.component';
import { BillingFacade } from '../../services/billing.facade';
import { signal } from '@angular/core';

describe('NewBillComponent', () => {
  let component: NewBillComponent;
  let fixture: ComponentFixture<NewBillComponent>;
  let mockFacade: any;

  beforeEach(async () => {
    mockFacade = {
      isSubmitting: signal(false),
      error: signal(null),
      draftBill: signal(null),
      submitNewBill: vitest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [NewBillComponent],
      providers: [
        { provide: BillingFacade, useValue: mockFacade }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call submitNewBill when form is populated with new client', () => {
    component.billForm.patchValue({
      isNewClient: true,
      clientName: 'Alice',
      clientEmail: 'alice@example.com'
    });
    
    // Valid form
    fixture.detectChanges();
    component.onSubmit();

    expect(mockFacade.submitNewBill).toHaveBeenCalledWith({
      isNewClient: true,
      clientIdOrName: 'Alice',
      clientEmail: 'alice@example.com'
    });
  });

  it('should format and show the reference when draftBill is present', () => {
    mockFacade.draftBill.set({ reference: 'F-2026-9999' });
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector('.success-message').textContent;
    expect(text).toContain('F-2026-9999');
  });

  it('should display error message when error is present', () => {
    mockFacade.error.set('My custom error');
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector('.error-message').textContent;
    expect(text).toContain('My custom error');
  });
});
