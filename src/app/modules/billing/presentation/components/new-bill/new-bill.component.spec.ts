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
      isSuccess: signal(false),
      error: signal(null),
      draftBill: signal(null),
      clients: signal([]),
      createInvoice: vitest.fn(),
      dismissSuccess: vitest.fn()
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
      paymentMode: 'Virement',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario'
    });

    fixture.detectChanges();
    component.onSubmit();

    expect(mockFacade.createInvoice).toHaveBeenCalledWith({
      ...component.invoiceForm.value,
      pdfFile: null
    });
  });

  it('should capture pdf metadata in form memory', () => {
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', {
      value: [
        new File(['%PDF-1.7'], 'devis.pdf', { type: 'application/pdf' })
      ]
    });

    component.onPdfSelected({ target: input } as unknown as Event);

    expect(component.selectedPdfFile).toEqual({
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
      paymentMode: 'Virement',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario'
    });

    component.onSubmit();

    expect(mockFacade.createInvoice).toHaveBeenCalledTimes(1);
    const payload = mockFacade.createInvoice.mock.calls[0][0] as Record<string, unknown>;
    expect(payload['scenario']).toBeUndefined();
  });

  it('keeps new-bill submit contract stable with optional chantier', () => {
    component.toggleRemindersAuto(false);
    component.invoiceForm.patchValue({
      clientId: 'c-legacy',
      amountTTC: 900,
      dueDate: '2026-07-01',
      invoiceNumber: 'FAC-LEGACY',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: false,
      reminderScenarioId: '',
      chantier: ''
    });

    component.onSubmit();

    expect(mockFacade.createInvoice).toHaveBeenCalledTimes(1);
    const payload = mockFacade.createInvoice.mock.calls[0][0] as Record<string, unknown>;
    expect(payload['clientId']).toBe('c-legacy');
    expect(payload['amountTTC']).toBe(900);
    expect(payload['dueDate']).toBe('2026-07-01');
    expect(payload['invoiceNumber']).toBe('FAC-LEGACY');
    expect(payload['chantier']).toBe('');
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

  it('should toggle reminder auto mode through form object', () => {
    component.toggleRemindersAuto(false);

    expect(component.invoiceForm.controls.remindersAutoEnabled.value).toBe(false);
    expect(component.invoiceForm.controls.reminderScenarioId.value).toBe('');

    component.toggleRemindersAuto(true);

    expect(component.invoiceForm.controls.remindersAutoEnabled.value).toBe(true);
    expect(component.invoiceForm.controls.reminderScenarioId.value).toBe('standard-reminder-scenario');
  });

  it('should block submit action while submitting', () => {
    mockFacade.isSubmitting.set(true);
    fixture.detectChanges();

    component.invoiceForm.patchValue({
      clientId: 'client-1',
      amountTTC: 1500,
      dueDate: '2026-06-30',
      invoiceNumber: 'FAC-200',
      paymentMode: 'Virement',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario'
    });

    component.onSubmit();

    expect(mockFacade.createInvoice).not.toHaveBeenCalled();
  });

  it('should show an accessible success modal and focus close button after success', () => {
    mockFacade.draftBill.set({
      id: 'b-1',
      reference: 'F-2026-0101',
      clientId: 'c-1',
      status: 'DRAFT',
      amountTTC: 1200,
      dueDate: '2026-09-10',
      externalInvoiceReference: 'FAC-101',
      type: 'Situation',
      paymentMode: 'Virement',
      pdfFile: null
    });
    mockFacade.isSuccess.set(true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const modal = host.querySelector<HTMLElement>('[role="dialog"]');
    expect(modal).toBeTruthy();
    expect(modal?.getAttribute('aria-modal')).toBe('true');

    const closeButton = host.querySelector<HTMLButtonElement>('[data-testid="success-modal-close"]');
    expect(closeButton).toBeTruthy();
    expect(document.activeElement).toBe(closeButton);
  });

  it('renders reminder scenario card with token-based classes', () => {
    const host = fixture.nativeElement as HTMLElement;

    const card = host.querySelector<HTMLElement>('[data-testid="reminder-card"]');
    expect(card).toBeTruthy();
    expect(card?.className).toContain('bg-surface');
    expect(card?.className).toContain('border-subtle');
    expect(card?.className).toContain('rounded-card');

    const select = host.querySelector<HTMLSelectElement>('#reminderScenarioId');
    expect(select?.value).toBe('standard-reminder-scenario');

    const toggle = host.querySelector<HTMLButtonElement>('[data-testid="reminder-toggle"]');
    expect(toggle).toBeTruthy();
    expect(toggle?.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows dynamic CTA label based on reminder toggle', () => {
    const host = fixture.nativeElement as HTMLElement;

    const submitButton = host.querySelector<HTMLButtonElement>('[data-testid="submit-bill-button"]');
    expect(submitButton?.textContent).toContain('Enregistrer et activer les relances');

    component.toggleRemindersAuto(false);
    fixture.detectChanges();

    expect(submitButton?.textContent).toContain('Enregistrer sans relances');
  });

  it('wires reminder select and toggle to form payload on submit', () => {
    component.invoiceForm.patchValue({
      clientId: 'client-1',
      amountTTC: 1500,
      dueDate: '2026-06-30',
      invoiceNumber: 'FAC-100',
      paymentMode: 'Virement',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario'
    });

    const host = fixture.nativeElement as HTMLElement;
    const select = host.querySelector<HTMLSelectElement>('#reminderScenarioId');
    expect(select).toBeTruthy();
    if (!select) {
      return;
    }

    select.value = 'standard-reminder-scenario';
    select.dispatchEvent(new Event('change'));

    component.onSubmit();

    const payload = mockFacade.createInvoice.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(payload['remindersAutoEnabled']).toBe(true);
    expect(payload['reminderScenarioId']).toBe('standard-reminder-scenario');
  });

  it('should reset the entire form after successful invoice creation', () => {
    component.invoiceForm.patchValue({
      clientId: 'client-1',
      chantier: 'Lot A',
      amountTTC: 2400,
      dueDate: '2026-09-01',
      invoiceNumber: 'FAC-RESET',
      type: 'Solde',
      paymentMode: 'Chèque'
    });
    component.selectedPdfFile = { name: 'facture.pdf', size: 1000, type: 'application/pdf' };
    component.toggleNewClientMode();
    component.invoiceForm.patchValue({ newClientName: 'Temp Client' });

    mockFacade.draftBill.set({
      id: 'b-2',
      reference: 'F-2026-0202',
      clientId: 'c-2',
      status: 'DRAFT',
      amountTTC: 2400,
      dueDate: '2026-09-01',
      externalInvoiceReference: 'FAC-RESET',
      type: 'Solde',
      paymentMode: 'Chèque',
      pdfFile: null
    });
    mockFacade.isSuccess.set(true);
    fixture.detectChanges();

    expect(component.invoiceForm.controls.clientId.value).toBe('');
    expect(component.invoiceForm.controls.newClientName.value).toBe('');
    expect(component.invoiceForm.controls.chantier.value).toBe('');
    expect(component.invoiceForm.controls.amountTTC.value).toBeNull();
    expect(component.invoiceForm.controls.dueDate.value).toBe('');
    expect(component.invoiceForm.controls.invoiceNumber.value).toBe('');
    expect(component.invoiceForm.controls.type.value).toBe('Situation');
    expect(component.invoiceForm.controls.paymentMode.value).toBe('Virement');
    expect(component.selectedPdfFile).toBeNull();
  });

  // Test is removed since `.success-message` is not currently in the updated component HTML template.
  // When added back, we can test it again here.
  // it('should format and show the reference when draftBill is present', () => { ... });

  // Test is removed since `.error-message` is not currently in the updated component HTML template.
  // When added back, we can test it again here.
  // it('should display error message when error is present', () => { ... });
});
