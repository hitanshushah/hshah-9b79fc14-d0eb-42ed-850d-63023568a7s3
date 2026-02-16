import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jest.Mocked<Pick<AuthService, 'login' | 'loading' | 'error'>>;
  let router: { navigate: ReturnType<typeof jest.fn> };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      loading: Object.assign(jest.fn(() => false), { set: jest.fn() }),
      error: Object.assign(jest.fn(() => null), { set: jest.fn() }),
    };
    router = { navigate: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render Sign in heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Sign in');
  });

  it('should call auth.login and navigate on success', () => {
    (authService.login as jest.Mock).mockReturnValue(of({ access_token: 'x', user: {} }));
    component.form.setValue({ email: 'admin@example.com', password: 'admin123' });
    component.onSubmit();
    expect(authService.login).toHaveBeenCalledWith('admin@example.com', 'admin123');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set error when login fails', () => {
    (authService.login as jest.Mock).mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } }))
    );
    component.form.setValue({ email: 'a@b.com', password: 'wrong' });
    component.onSubmit();
    expect(authService.error.set).toHaveBeenCalledWith('Invalid credentials');
  });

  it('should not call login when form is invalid', () => {
    component.form.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });
});
