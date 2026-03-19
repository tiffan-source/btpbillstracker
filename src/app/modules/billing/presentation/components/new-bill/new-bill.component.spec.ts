import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewBillComponent } from './new-bill.component';
import { BillingFacade } from '../../services/billing.facade';
import { signal, WritableSignal } from '@angular/core';

describe('NewBillComponent', () => {
  let component: NewBillComponent;
  let fixture: ComponentFixture<NewBillComponent>;
  let mockFacade: any;

  beforeEach(async () => {
    mockFacade = {
      isSubmitting: signal(false),
      error: signal(null),
      draftBill: signal(null),
      createDraftBill: vitest.fn()
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

  it('should call createDraftBill with a hardcoded client ID when button is clicked', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(mockFacade.createDraftBill).toHaveBeenCalledWith('HARDCODED-CLIENT-ID');
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
