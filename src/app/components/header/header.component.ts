import { CommonModule } from '@angular/common';
import { Component, inject, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/helpers/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class HeaderComponent {
  private authService = inject(AuthService);

  public menuAberto   = false;
  public userMenuOpen = false;

  // Signals do AuthService — usados diretamente no template
  public get isLogged():   boolean { return this.authService.is_logged(); }
  public get userName():   string  { return this.authService.currentUser()?.name ?? ''; }
  public get userInitial(): string { return this.userName.charAt(0).toUpperCase() || '?'; }

  public toggleMenu(): void {
    this.menuAberto   = !this.menuAberto;
    this.userMenuOpen = false;
  }

  public toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    this.menuAberto   = false;
  }

  public logout(): void {
    this.userMenuOpen = false;
    this.menuAberto   = false;
    this.authService.logout();
  }

  // Fecha os menus ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-container') && !target.closest('.profile-container')) {
      this.menuAberto   = false;
      this.userMenuOpen = false;
    }
  }
}