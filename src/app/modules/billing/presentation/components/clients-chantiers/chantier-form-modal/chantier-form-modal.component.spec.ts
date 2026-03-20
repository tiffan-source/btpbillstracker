import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { ChantierFormModalComponent } from './chantier-form-modal.component';

@Component({
  imports: [ChantierFormModalComponent],
  template: `
    <app-chantier-form-modal
      [isOpen]="isOpen()"
      [chantier]="chantier()"
      [isSubmitting]="false"
      (closed)="onClosed()"
      (saved)="onSaved($event)"
    />
  `
})
class HostComponent {
  readonly isOpen = signal(true);
  readonly chantier = signal({ id: 'ch-1', name: 'Villa A' });

  closed = 0;
  savedPayload: { id: string; name: string } | null = null;

  onClosed(): void {
    this.closed += 1;
  }

  onSaved(payload: { id: string; name: string }): void {
    this.savedPayload = payload;
  }
}

describe('ChantierFormModalComponent', () => {
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

  it('focuses chantier name input when opening modal', () => {
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('#chantierName') as HTMLInputElement | null;
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

    expect(hostComponent.savedPayload).toEqual({ id: 'ch-1', name: 'Villa A' });
  });
});
