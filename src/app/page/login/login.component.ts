import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/helpers/auth.service';
import { environment } from '@environments/environments';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  public activeTab: 'login' | 'register' = 'login';
  public isLoading = false;
  public showPassword = false;
  public loginError: string | null = null;
  public successMessage: string | null = null;

  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  public registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  public setTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.loginError = null;
    this.successMessage = null;
  }

  public togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  public isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c?.invalid && (c.dirty || c.touched));
  }

  public onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.loginError = null;

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password }, rememberMe).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.loginError = err?.error?.message || 'E-mail ou senha incorretos.';
      },
    });
  }

  public onRegister(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.loginError = null;

    this.http.post(`${environment.api}auth/register`, this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Conta criada com sucesso! Faça login para continuar.';
        this.registerForm.reset();
        setTimeout(() => {
          this.successMessage = null;
          this.setTab('login');
        }, 1800);
      },
      error: (err) => {
        this.isLoading = false;
        this.loginError = err?.error?.message || 'Erro ao criar conta. Tente novamente.';
      },
    });
  }
}