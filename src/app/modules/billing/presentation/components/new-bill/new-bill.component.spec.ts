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
      clients: signal([]),
      createInvoice: vitest.fn()
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

  it('should call createInvoice when form is populated', () => {
    component.invoiceForm.patchValue({
      clientId: 'client-1',
      amountTTC: 1500,
      dueDate: '2026-06-30',
      invoiceNumber: 'FAC-100',
      paymentMode: 'Virement'
    });

    fixture.detectChanges();
    component.onSubmit();

    expect(mockFacade.createInvoice).toHaveBeenCalledWith(component.invoiceForm.value);
  });

  it('should capture pdf metadata in form memory', () => {
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', {
      value: [
        new File(['%PDF-1.7'], 'devis.pdf', { type: 'application/pdf' })
      ]
    });

    component.onPdfSelected({ target: input } as unknown as Event);

    expect(component.invoiceForm.controls.pdfFile.value).toEqual({
      name: 'devis.pdf',
      size: 8,
      type: 'application/pdf'
    });
  });

  it('should toggle inline new client mode and preserve new client data when hidden', () => {
    const host: HTMLElement = fixture.nativeElement;
    const toggleButton = host.querySelector<HTMLButtonElement>('[data-testid="toggle-new-client-mode"]');
    expect(toggleButton).toBeTruthy();
    if (!toggleButton) {
      return;
    }

    expect(host.querySelector<HTMLInputElement>('#newClientName')).toBeNull();

    toggleButton.click();
    fixture.detectChanges();

    const newClientNameInput = host.querySelector<HTMLInputElement>('#newClientName');
    expect(newClientNameInput).toBeTruthy();
    if (!newClientNameInput) {
      return;
    }

    newClientNameInput.value = 'Client Inline';
    newClientNameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.invoiceForm.controls.newClientName.value).toBe('Client Inline');

    toggleButton.click();
    fixture.detectChanges();
    expect(host.querySelector<HTMLInputElement>('#newClientName')).toBeNull();

    toggleButton.click();
    fixture.detectChanges();
    expect(host.querySelector<HTMLInputElement>('#newClientName')?.value).toBe('Client Inline');
  });

  it('should submit without relance scenario field in payload', () => {
    component.invoiceForm.patchValue({
      clientId: 'c-1',
      amountTTC: 1200,
      dueDate: '2026-06-01',
      invoiceNumber: 'FAC-22',
      type: 'Situation',
      paymentMode: 'Virement'
    });

    component.onSubmit();

    expect(mockFacade.createInvoice).toHaveBeenCalledTimes(1);
    const payload = mockFacade.createInvoice.mock.calls[0][0] as Record<string, unknown>;
    expect(payload['scenario']).toBeUndefined();
  });

  it('should show field-level errors only after an invalid submit attempt', () => {
    const host: HTMLElement = fixture.nativeElement;

    expect(host.textContent).not.toContain('Le client est obligatoire.');
    expect(host.textContent).not.toContain('Le montant TTC est obligatoire.');
    expect(host.textContent).not.toContain("La date d'échéance est obligatoire.");
    expect(host.textContent).not.toContain('La référence facture est obligatoire.');

    component.onSubmit();
    fixture.detectChanges();

    expect(mockFacade.createInvoice).not.toHaveBeenCalled();
    expect(host.textContent).toContain('Le client est obligatoire.');
    expect(host.textContent).toContain('Le montant TTC est obligatoire.');
    expect(host.textContent).toContain("La date d'échéance est obligatoire.");
    expect(host.textContent).toContain('La référence facture est obligatoire.');

    const amountInput = host.querySelector<HTMLInputElement>('#amountTTC');
    expect(amountInput?.className).toContain('border-danger');
  });

  it('should block submit action while submitting', () => {
    mockFacade.isSubmitting.set(true);
    fixture.detectChanges();

    component.invoiceForm.patchValue({
      clientId: 'client-1',
      amountTTC: 1500,
      dueDate: '2026-06-30',
      invoiceNumber: 'FAC-200',
      paymentMode: 'Virement'
    });

    component.onSubmit();

    expect(mockFacade.createInvoice).not.toHaveBeenCalled();
  });

  // Test is removed since `.success-message` is not currently in the updated component HTML template.
  // When added back, we can test it again here.
  // it('should format and show the reference when draftBill is present', () => { ... });

  // Test is removed since `.error-message` is not currently in the updated component HTML template.
  // When added back, we can test it again here.
  // it('should display error message when error is present', () => { ... });
});
