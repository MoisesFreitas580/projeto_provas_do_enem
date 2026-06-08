import { ChangeDetectorRef, Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimulationsService } from '@services/simulations/simulations.service';
import { ExactExamFormComponent } from '@components/exact-exam-form/exact-exam-form.component';
import { RandomExamFormComponent } from '@components/random-exam-form/random-exam-form.component';
import { ManualExamFormComponent } from '@components/manual-exam-form/manual-exam-form.component';


@Component({
  selector: 'app-create-simulation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ExactExamFormComponent, RandomExamFormComponent, ManualExamFormComponent],
  templateUrl: './create-simulation-modal.component.html',
  styleUrls: ['./create-simulation-modal.component.scss']
})
export class CreateSimulationModalComponent {
  @Output() close = new EventEmitter<boolean>();

  private simulationsService = inject(SimulationsService);
  private cdr = inject(ChangeDetectorRef);

  public isLoading: boolean = false;
  public title: string = '';


  public strategy: 'exact_exam' | 'manual' | 'random' | 'filtered' = 'exact_exam';
  private childPayload: any = {};

  public closeModal(wasCreated: boolean = false): void {
    this.close.emit(wasCreated);
  }

  public updateChildPayload(payload: any): void {
    this.childPayload = payload;
  }

  public createSimulation(): void {
    if (this.strategy === 'manual' && (!this.childPayload.questionIds || this.childPayload.questionIds.length === 0)) {
      alert('Por favor, adicione pelo menos uma questão ao seu simulado manual!');
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    const finalPayload = {
      title: this.title || `Simulado - ${this.strategy}`,
      strategy: this.strategy,
      ...this.childPayload
    };

    console.log('JSON Enviado para a API:', finalPayload);

    this.simulationsService.generateSimulation(finalPayload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.closeModal(true);
      },
      error: (err: any) => {
        console.error('Erro ao gerar simulação:', err);
        alert('Erro ao criar simulação. Tente novamente.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}