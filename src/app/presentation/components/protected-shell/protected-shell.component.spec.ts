import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ProtectedShellComponent } from './protected-shell.component';

@Component({ template: '' })
class DummyPageComponent {}

describe('ProtectedShellComponent', () => {
  let fixture: ComponentFixture<ProtectedShellComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtectedShellComponent],
      providers: [
        provideRouter([
          { path: 'dashboard', component: DummyPageComponent },
          { path: 'new-bill', component: DummyPageComponent },
          { path: 'clients-chantiers', component: DummyPageComponent }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
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

  it('marks current route link as active with aria-current', async () => {
    await router.navigateByUrl('/new-bill');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    const activeLink = host.querySelector<HTMLAnchorElement>('[data-testid="nav-link-new-bill"]');
    const inactiveLink = host.querySelector<HTMLAnchorElement>('[data-testid="nav-link-dashboard"]');

    expect(activeLink?.getAttribute('aria-current')).toBe('page');
    expect(activeLink?.className).toContain('bg-sidebar-hover');
    expect(inactiveLink?.getAttribute('aria-current')).toBeNull();
  });

  it('exposes non-available entries as disabled buttons', () => {
    const host = fixture.nativeElement as HTMLElement;
    const remindersButton = host.querySelector<HTMLButtonElement>('[data-testid="nav-disabled-reminders"]');
    const templatesButton = host.querySelector<HTMLButtonElement>('[data-testid="nav-disabled-templates"]');

    expect(remindersButton?.disabled).toBe(true);
    expect(remindersButton?.getAttribute('aria-disabled')).toBe('true');
    expect(templatesButton?.disabled).toBe(true);
    expect(templatesButton?.getAttribute('aria-disabled')).toBe('true');
  });

  it('opens and closes the mobile drawer, including Escape close', () => {
    const host = fixture.nativeElement as HTMLElement;
    const openButton = host.querySelector<HTMLButtonElement>('[data-testid="mobile-menu-open"]');
    const closeButtonSelector = '[data-testid="mobile-menu-close"]';
    const drawerSelector = '[data-testid="mobile-drawer"]';

    expect(openButton).toBeTruthy();
    if (!openButton) {
      return;
    }

    expect(host.querySelector(drawerSelector)).toBeNull();

    openButton.click();
    fixture.detectChanges();
    expect(host.querySelector(drawerSelector)).toBeTruthy();

    const closeButton = host.querySelector<HTMLButtonElement>(closeButtonSelector);
    expect(closeButton).toBeTruthy();
    closeButton?.click();
    fixture.detectChanges();
    expect(host.querySelector(drawerSelector)).toBeNull();

    openButton.click();
    fixture.detectChanges();
    expect(host.querySelector(drawerSelector)).toBeTruthy();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(host.querySelector(drawerSelector)).toBeNull();
  });

  it('keeps navigation landmark labels for desktop and mobile', () => {
    const host = fixture.nativeElement as HTMLElement;
    const desktopNav = host.querySelector('nav[aria-label="Navigation principale"]');
    const openButton = host.querySelector<HTMLButtonElement>('[data-testid="mobile-menu-open"]');

    expect(desktopNav).toBeTruthy();
    openButton?.click();
    fixture.detectChanges();

    const mobileNav = host.querySelector('nav[aria-label="Navigation principale mobile"]');
    expect(mobileNav).toBeTruthy();
  });
});
