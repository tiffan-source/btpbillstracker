import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { ClientFormModalComponent } from './client-form-modal.component';

@Component({
  imports: [ClientFormModalComponent],
  template: `
    <app-client-form-modal
      [isOpen]="isOpen()"
      [client]="client()"
      [isSubmitting]="false"
      (closed)="onClosed()"
      (saved)="onSaved($event)"
    />
  `
})
class HostComponent {
  readonly isOpen = signal(true);
  readonly client = signal({
    id: 'c-1',
    firstName: 'Alice',
    lastName: 'Martin',
    email: 'alice@example.com',
    phone: '+2290100000000'
  });

  closed = 0;
  savedPayload: { id: string; firstName: string; lastName: string; email: string; phone: string } | null = null;

  onClosed(): void {
    this.closed += 1;
  }

  onSaved(payload: { id: string; firstName: string; lastName: string; email: string; phone: string }): void {
    this.savedPayload = payload;
  }
}

describe('ClientFormModalComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('focuses first name input when opening modal', () => {
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('#firstName') as HTMLInputElement | null;
    expect(input).toBeTruthy();
    expect(document.activeElement).toBe(input);
  });

  it('emits close on escape key', () => {
    const host = fixture.nativeElement as HTMLElement;
    const overlay = host.querySelector('.fixed.inset-0');
    overlay?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(hostComponent.closed).toBe(1);
  });

  it('emits saved payload on valid submit', () => {
    const host = fixture.nativeElement as HTMLElement;
    const form = host.querySelector('form');
    form?.dispatchEvent(new Event('submit'));

    expect(hostComponent.savedPayload).toEqual({
      id: 'c-1',
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@example.com',
      phone: '+2290100000000'
    });
  });
});
