import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { ToastComponent } from "@components/toast/toast.component";
import { ConfirmComponent } from "@components/confirm/confirm.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ToastComponent, ConfirmComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('projeto-provas-do-enem');
}
