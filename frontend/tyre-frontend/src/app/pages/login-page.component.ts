import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="auth-shell">
      <section class="auth-card">
        <h2>{{ 'auth.loginTitle' | translate }}</h2>
        <form class="form" (ngSubmit)="submit()">
          <input [(ngModel)]="email" name="email" type="email" [placeholder]="'auth.email' | translate" required />
          <input
            [(ngModel)]="password"
            name="password"
            type="password"
            [placeholder]="'auth.password' | translate"
            required
          />
          <button class="btn" type="submit">{{ 'auth.login' | translate }}</button>
        </form>
        <p *ngIf="error" class="error">{{ error }}</p>
        <p class="meta">
          {{ 'auth.noAccount' | translate }}
          <a routerLink="/register">{{ 'auth.register' | translate }}</a>
        </p>
      </section>
    </div>
  `,
  styles: [
    `
      .auth-shell {
        min-height: 60vh;
        display: grid;
        place-items: center;
      }
      .auth-card {
        width: min(440px, 100%);
        padding: 24px 22px 22px;
        border-radius: 24px;
        background: var(--panel);
        border: 1px solid var(--border);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
        color: var(--text);
      }
      .auth-card h2 {
        margin: 0 0 16px;
        font-size: 26px;
      }
      .form {
        display: grid;
        gap: 12px;
        margin-bottom: 10px;
      }
      .form input {
        height: 46px;
        border-radius: 14px;
        border: 1px solid var(--border);
        padding: 0 12px;
        background: var(--panel-2);
        color: var(--text);
        font-size: 15px;
      }
      .form input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.4);
      }
      .error {
        color: #f97373;
        margin: 0 0 4px;
        font-size: 14px;
      }
      .meta {
        margin: 0;
        font-size: 14px;
        color: var(--muted);
      }
      .meta a {
        color: #22c55e;
        text-decoration: none;
      }
      .meta a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginPageComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  submit(): void {
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/cars'),
      error: (err) => (this.error = err?.error?.detail || this.translate.instant('auth.loginFailed')),
    });
  }
}
