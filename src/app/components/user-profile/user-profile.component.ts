import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@services/user/user.service';
import { ToastService } from '@components/toast/toast.component.service'; 
import { ConfirmService } from '@components/confirm/confirm.component.service'; 
import { AuthService } from '../../core/helpers/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);

  public isLoading = signal(true);
  public isSaving = signal(false);

  // Dados do utilizador
  public userData: any = null;
  public editName: string = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.userService.getMe().subscribe({
      next: (res) => {
        this.userData = res;
        this.editName = res.name || '';
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar perfil', err);
        this.toastService.show('Erro ao carregar informações do perfil.', 'error');
        this.isLoading.set(false);
      }
    });
  }

  public saveProfile(): void {
    if (!this.editName.trim() || this.editName === this.userData?.name) {
      return; // Não salva se estiver vazio ou igual
    }

    this.isSaving.set(true);
    this.toastService.show('A guardar alterações...', 'loading');

    this.userService.updateMe({ name: this.editName }).subscribe({
      next: (res) => {
        this.userData.name = this.editName; // Atualiza localmente
        
        // // Se o AuthService guarda o nome, convém atualizá-lo também para o header refletir
        // if (this.authService.updateCurrentUser) {
        //    this.authService.up({ ...this.userData, name: this.editName });
        // }

        this.isSaving.set(false);
        this.toastService.show('Perfil atualizado com sucesso!', 'success');
      },
      error: () => {
        this.isSaving.set(false);
        this.toastService.show('Erro ao atualizar perfil.', 'error');
      }
    });
  }

  public async deleteAccount(): Promise<void> {
    const confirmed = await this.confirmService.ask(
      'Excluir Conta Permanentemente',
      'Tem a certeza absoluta de que deseja excluir a sua conta? Todo o seu progresso, simulados e relatórios serão perdidos para sempre. Esta ação não pode ser desfeita.',
      'Sim, Excluir a minha conta',
      'Cancelar'
    );

    if (!confirmed) return;

    this.toastService.show('A processar exclusão...', 'loading');

    this.userService.deleteMe().subscribe({
      next: () => {
        this.toastService.show('Conta excluída com sucesso.', 'success');
        // Limpa o token/storage
        this.authService.logout(); 
        // Redireciona para o login (como pedido na sua rota)
        this.router.navigate(['/login']);
      },
      error: () => {
        this.toastService.show('Não foi possível excluir a conta. Tente novamente.', 'error');
      }
    });
  }

  public getRoleLabel(role: string): string {
    return role === 'STUDENT' ? 'Estudante' : role === 'ADMIN' ? 'Administrador' : role;
  }
}