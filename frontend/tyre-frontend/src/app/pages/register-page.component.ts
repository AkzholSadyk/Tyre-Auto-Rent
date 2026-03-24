import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <h2>{{ 'auth.registerTitle' | translate }}</h2>
    <form class="form" (ngSubmit)="submit()">
      <input [(ngModel)]="first_name" name="first_name" [placeholder]="'auth.firstName' | translate" required />
      <input [(ngModel)]="last_name" name="last_name" [placeholder]="'auth.lastName' | translate" required />
      <input [(ngModel)]="phone" name="phone" [placeholder]="'auth.phone' | translate" />
      <input [(ngModel)]="email" name="email" type="email" [placeholder]="'auth.email' | translate" required />
      <input [(ngModel)]="password" name="password" type="password" [placeholder]="'auth.password' | translate" required />
      <button class="btn" type="submit">{{ 'auth.createAccount' | translate }}</button>
    </form>
    <p *ngIf="error" class="error">{{ error }}</p>
    <p>{{ 'auth.haveAccount' | translate }} <a routerLink="/login">{{ 'auth.login' | translate }}</a></p>
  `,
  styles: ['.form{display:grid;gap:10px;max-width:420px}.error{color:#b00020}'],
})
export class RegisterPageComponent {
  first_name = '';
  last_name = '';
  phone = '';
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
    this.auth
      .register({
        first_name: this.first_name,
        last_name: this.last_name,
        phone: this.phone || undefined,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/profile'),
        error: (err) => (this.error = err?.error?.detail || this.translate.instant('auth.registerFailed')),
      });
  }
}
