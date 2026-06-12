import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '@services/catalog/catalog.service';

@Component({
  selector: 'app-random-exam-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './random-exam-form.component.html',
  styleUrls: ['./random-exam-form.component.scss'],
})
export class RandomExamFormComponent implements OnInit {
  @Output() payloadChange = new EventEmitter<any>();

  private catalogService = inject(CatalogService);

  public quantity     = 15;
  public areas:       any[] = [];
  public competencies: any[] = [];
  public skills:       any[] = [];

  public selectedArea       = '';
  public selectedCompetency = '';
  public selectedSkill      = '';

  ngOnInit(): void {
    this.loadAreas();
    this.emit();
  }

  private loadAreas(): void {
    this.catalogService.getAreas().subscribe({
      next: (res: any) => this.areas = res.data || [],
    });
  }

  public onAreaChange(): void {
    this.selectedCompetency = '';
    this.selectedSkill = '';
    this.competencies = [];
    this.skills = [];
    if (this.selectedArea) {
      this.catalogService.getCompetencies({ area: this.selectedArea }).subscribe({
        next: (res: any) => this.competencies = res.data || [],
      });
    }
    this.emit();
  }

  public onCompetencyChange(): void {
    this.selectedSkill = '';
    this.skills = [];
    if (this.selectedCompetency && this.selectedArea) {
      this.catalogService.getSkills({ area: this.selectedArea, competencyCode: this.selectedCompetency }).subscribe({
        next: (res: any) => this.skills = res.data || [],
      });
    }
    this.emit();
  }

  public emit(): void {
    const filters: any = {};
    if (this.selectedArea)       filters.area           = this.selectedArea;
    if (this.selectedCompetency) filters.competencyCode = this.selectedCompetency;
    if (this.selectedSkill)      filters.skillCode      = this.selectedSkill;

    this.payloadChange.emit({ quantity: this.quantity, filters });
  }
}