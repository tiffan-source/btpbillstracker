import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { AuthSessionFacade } from '../services/auth-session.facade';
import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  let fixture: ComponentFixture<RegisterPageComponent>;
  let component: RegisterPageComponent;
  let facadeMock: {
    error: ReturnType<typeof signal<string | null>>;
    isSubmitting: ReturnType<typeof signal<boolean>>;
    registerWithEmail: ReturnType<typeof vi.fn>;
  };
  let routerMock: {
    navigateByUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    facadeMock = {
      error: signal<string | null>(null),
      isSubmitting: signal(false),
      registerWithEmail: vi.fn().mockResolvedValue(false)
    };
    routerMock = {
      navigateByUrl: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        { provide: AuthSessionFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({ returnUrl: '/new-bill' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders register inputs and submit action', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector<HTMLInputElement>('#register-email')).toBeTruthy();
    expect(host.querySelector<HTMLInputElement>('#register-password')).toBeTruthy();
    expect(host.querySelector<HTMLInputElement>('#register-confirm-password')).toBeTruthy();
    expect(host.textContent).toContain("S'inscrire");
  });

  it('blocks submit when passwords do not match', async () => {
    component.form.patchValue({
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password321'
    });

    await component.onSubmit();

    expect(facadeMock.registerWithEmail).not.toHaveBeenCalled();
  });

  it('submits register form and redirects to returnUrl on success', async () => {
    facadeMock.registerWithEmail.mockResolvedValue(true);
    component.form.patchValue({
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    await component.onSubmit();

    expect(facadeMock.registerWithEmail).toHaveBeenCalledWith('user@example.com', 'password123');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/new-bill');
  });

  it('falls back to /dashboard when returnUrl is empty', async () => {
    await TestBed.resetTestingModule();
    facadeMock = {
      error: signal<string | null>(null),
      isSubmitting: signal(false),
      registerWithEmail: vi.fn().mockResolvedValue(true)
    };
    routerMock = {
      navigateByUrl: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
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

    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.form.patchValue({
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    await component.onSubmit();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });
});
