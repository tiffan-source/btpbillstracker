import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditBillForm } from '../../forms/edit-bill.form';
import { EditBillModalComponent } from './edit-bill-modal.component';

describe('EditBillModalComponent', () => {
  let fixture: ComponentFixture<EditBillModalComponent>;
  let component: EditBillModalComponent;
  let form: EditBillForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBillModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EditBillModalComponent);
    component = fixture.componentInstance;
    form = new EditBillForm();
    form.patchValue({
      id: 'b-1',
      reference: 'F-2026-0011',
      clientId: 'client-1',
      chantierId: 'ch-1',
      chantierName: '',
      shouldCreateChantier: false,
      amountTTC: 156,
      dueDate: '2026-03-19',
      invoiceNumber: 'EXT-11',
      type: 'Situation',
      paymentMode: 'Chèque',
      status: 'PAID',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario'
    });
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('clients', [{ id: 'client-1', name: 'Marie Lambert' }]);
    fixture.componentRef.setInput('chantiers', [{ id: 'ch-1', name: 'Cadjehoun' }]);
    fixture.componentRef.setInput('duplicateChantierPrompt', null);
    fixture.detectChanges();
  });

  it('renders modal dialog with expected accessibility attributes', () => {
    const host = fixture.nativeElement as HTMLElement;
    const dialog = host.querySelector<HTMLElement>('[role="dialog"]');

    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(host.textContent).toContain('Modifier la facture');
  });

  it('contains blueprint fields including status and reminder toggle area', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('#clientId')).toBeTruthy();
    expect(host.querySelector('#newClientName')).toBeTruthy();
    expect(host.querySelector('#chantier')).toBeTruthy();
    expect(host.querySelector('[data-testid="edit-toggle-new-chantier-mode"]')).toBeTruthy();
    expect(host.querySelector('#amountTTC')).toBeTruthy();
    expect(host.querySelector('#dueDate')).toBeTruthy();
    expect(host.querySelector('#invoiceNumber')).toBeTruthy();
    expect(host.querySelector('#type')).toBeTruthy();
    expect(host.querySelector('#paymentMode')).toBeTruthy();
    expect(host.querySelector('#status')).toBeTruthy();
    expect(host.querySelector('#reminderScenarioId')).toBeTruthy();
    expect(host.querySelector('[data-testid="reminder-toggle"]')).toBeTruthy();
  });

  it('renders chantier selector with provided scoped options', () => {
    const host = fixture.nativeElement as HTMLElement;
    const chantierSelect = host.querySelector<HTMLSelectElement>('#chantier');

    expect(chantierSelect).toBeTruthy();
    const options = chantierSelect ? Array.from(chantierSelect.options).map((option) => option.textContent?.trim()) : [];
    expect(options).toContain('Cadjehoun');
  });

  it('keeps out-of-list chantier selected by appending a fallback option', () => {
    form.controls.chantierId.setValue('ch-out');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const chantierSelect = host.querySelector<HTMLSelectElement>('#chantier');
    const optionValues = chantierSelect ? Array.from(chantierSelect.options).map((option) => option.value) : [];
    const optionLabels = chantierSelect ? Array.from(chantierSelect.options).map((option) => option.textContent?.trim()) : [];

    expect(optionValues).toContain('ch-out');
    expect(optionLabels.some((label) => label?.includes('(hors liste)'))).toBe(true);
    expect(form.controls.chantierId.value).toBe('ch-out');
  });

  it('toggles new chantier mode and keeps chantier name when hidden', () => {
    const host = fixture.nativeElement as HTMLElement;
    const toggleButton = host.querySelector<HTMLButtonElement>('[data-testid="edit-toggle-new-chantier-mode"]');
    expect(toggleButton).toBeTruthy();
    if (!toggleButton) {
      return;
    }

    toggleButton.click();
    fixture.detectChanges();

    const chantierNameInput = host.querySelector<HTMLInputElement>('#chantierName');
    expect(chantierNameInput).toBeTruthy();
    if (!chantierNameInput) {
      return;
    }

    chantierNameInput.value = 'Lot A';
    chantierNameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(form.controls.chantierName.value).toBe('Lot A');

    toggleButton.click();
    fixture.detectChanges();
    expect(host.querySelector<HTMLInputElement>('#chantierName')).toBeNull();

    toggleButton.click();
    fixture.detectChanges();
    expect(host.querySelector<HTMLInputElement>('#chantierName')?.value).toBe('Lot A');
  });

  it('renders duplicate chantier modal and emits corresponding actions', () => {
    const useExistingSpy = vitest.fn();
    const createNewSpy = vitest.fn();
    const closeSpy = vitest.fn();
    component.useExistingChantier.subscribe(useExistingSpy);
    component.createNewChantier.subscribe(createNewSpy);
    component.closeDuplicateChantierPrompt.subscribe(closeSpy);
    fixture.componentRef.setInput('duplicateChantierPrompt', { existingChantierName: 'Cadjehoun' });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('[data-testid="edit-duplicate-chantier-use-existing"]')?.click();
    host.querySelector<HTMLButtonElement>('[data-testid="edit-duplicate-chantier-create-new"]')?.click();
    host.querySelector<HTMLButtonElement>('[data-testid="edit-duplicate-chantier-cancel"]')?.click();

    expect(useExistingSpy).toHaveBeenCalledTimes(1);
    expect(createNewSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('emits close request on escape when not submitting', () => {
    const closeSpy = vitest.fn();
    component.requestClose.subscribe(closeSpy);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(closeSpy).toHaveBeenCalled();
  });

  it('does not emit close request on escape while submitting', () => {
    const closeSpy = vitest.fn();
    component.requestClose.subscribe(closeSpy);
    fixture.componentRef.setInput('isSubmitting', true);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('emits save on submit and locks actions while submitting', () => {
    const saveSpy = vitest.fn();
    component.save.subscribe(saveSpy);

    const formEl = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formEl.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(saveSpy).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('isSubmitting', true);
    fixture.detectChanges();

    const cancelButton = fixture.nativeElement.querySelector(
      '[data-testid="edit-modal-cancel"]'
    ) as HTMLButtonElement;
    const closeButton = fixture.nativeElement.querySelector(
      '[data-testid="edit-modal-close"]'
    ) as HTMLButtonElement;
    const saveButton = fixture.nativeElement.querySelector(
      '[data-testid="edit-modal-save"]'
    ) as HTMLButtonElement;

    expect(cancelButton.disabled).toBe(true);
    expect(closeButton.disabled).toBe(true);
    expect(saveButton.disabled).toBe(true);
  });

  it('emits close request when clicking overlay if not submitting', () => {
    const closeSpy = vitest.fn();
    component.requestClose.subscribe(closeSpy);
    const overlay = fixture.nativeElement.querySelector('.fixed.inset-0') as HTMLElement;

    overlay.click();

    expect(closeSpy).toHaveBeenCalled();
  });
});
