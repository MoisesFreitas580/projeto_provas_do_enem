import { Injectable, Inject, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root',
})
export class HandleMessagesService {

    private $mes = inject(MessageService);

    messages = {
        auth: {
            400: [
                'error',
                'Erro!',
                'Usuário ou senha inválidos! Verifique suas credenciais e tente novamente!',
            ],
            401: [
                'error',
                'Erro!',
                'Usuário ou senha inválidos!  Verifique suas credenciais e tente novamente!',
            ],
            500: [
                'error',
                'Erro!',
                'Erro interno do servidor! Por favor, tente novamente mais tarde!',
            ],
            expired: [
                'error',
                'Erro!',
                'Sessão expirada! Por favor, faça seu login novamente!',
            ],
            logout: ['info', 'Logout', 'Você saiu do sistema!'],
            not_allowed: [
                'error',
                'Erro!',
                'Você não tem permissão para acessar essa página!',
            ],
        },
        form: {
            invalid: [
                'error',
                'Erro!',
                'Verifique os campos do formulário e tente novamente!',
            ],
            success: ['success', 'Sucesso!', 'Cadastro realizado com sucesso!'],
            error: [
                'error',
                'Erro!',
                'Um erro inesperado ocorreu! Por favor, tente novamente mais tarde!',
            ],
        },
    };

    addMsg(
        type: 'success' | 'error' | 'info' | 'warn' | string,
        summary: string,
        message: string
    ) {
        this.$mes.add({ severity: type, summary: summary, detail: message });
    }

    addMsgByList(message: string[]) {
        try {
            this.$mes.add({
                severity: message[0] as 'success' | 'error' | 'info' | 'warn',
                summary: message[1],
                detail: message[2],
            });
        } catch (error) {
            this.addMsg(
                'error',
                'Erro!',
                'Um erro inesperado ocorreu! Por favor, tente novamente mais tarde!'
            );
        }
    }
}
