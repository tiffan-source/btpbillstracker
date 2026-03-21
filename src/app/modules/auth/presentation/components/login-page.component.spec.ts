import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { AuthSessionFacade } from '../services/auth-session.facade';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let component: LoginPageComponent;
  let facadeMock: {
    error: ReturnType<typeof signal<string | null>>;
    isSubmitting: ReturnType<typeof signal<boolean>>;
    loginWithEmail: ReturnType<typeof vi.fn>;
    loginWithGoogle: ReturnType<typeof vi.fn>;
    loginWithFacebook: ReturnType<typeof vi.fn>;
  };
  let routerMock: {
    navigateByUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    facadeMock = {
      error: signal<string | null>(null),
      isSubmitting: signal(false),
      loginWithEmail: vi.fn().mockResolvedValue(false),
      loginWithGoogle: vi.fn().mockResolvedValue(false),
      loginWithFacebook: vi.fn().mockResolvedValue(false)
    };
    routerMock = {
      navigateByUrl: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: AuthSessionFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({ returnUrl: '/clients-chantiers' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders email/password inputs and social auth buttons', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector<HTMLInputElement>('#login-email')).toBeTruthy();
    expect(host.querySelector<HTMLInputElement>('#login-password')).toBeTruthy();
    expect(host.textContent).toContain('Continuer avec Google');
    expect(host.textContent).toContain('Continuer avec Facebook');
  });

  it('blocks email submit when form is invalid', async () => {
    await component.onSubmit();

    expect(facadeMock.loginWithEmail).not.toHaveBeenCalled();
  });

  it('submits email/password and redirects to returnUrl on success', async () => {
    facadeMock.loginWithEmail.mockResolvedValue(true);
    const host = fixture.nativeElement as HTMLElement;
    const emailInput = host.querySelector<HTMLInputElement>('#login-email');
    const passwordInput = host.querySelector<HTMLInputElement>('#login-password');

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    if (!emailInput || !passwordInput) {
      return;
    }

    emailInput.value = 'john@doe.test';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    await component.onSubmit();

    expect(facadeMock.loginWithEmail).toHaveBeenCalledWith('john@doe.test', 'password123');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/clients-chantiers');
  });

  it('falls back to /dashboard when returnUrl is empty', async () => {
    await TestBed.resetTestingModule();
    facadeMock = {
      error: signal<string | null>(null),
      isSubmitting: signal(false),
      loginWithEmail: vi.fn().mockResolvedValue(true),
      loginWithGoogle: vi.fn().mockResolvedValue(false),
      loginWithFacebook: vi.fn().mockResolvedValue(false)
    };
    routerMock = {
      navigateByUrl: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: AuthSessionFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({ returnUrl: '' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.form.patchValue({ email: 'john@doe.test', password: 'password123' });

    await component.onSubmit();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });
});
