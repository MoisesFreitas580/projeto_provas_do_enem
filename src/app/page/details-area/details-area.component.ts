import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CatalogService } from '@services/catalog/catalog.service'; 

export interface Skill {
  id: string;
  competencyId: string;
  code: string;
  description: string;
}

export interface Competency {
  id: string;
  areaId: string;
  code: number;
  description: string;
  skills: Skill[];
  showSkills: boolean; 
}

export interface KnowledgeObject {
  id: string;
  disciplineId: string;
  name: string;
}

export interface Discipline {
  id: string;
  areaId: string;
  name: string;
  knowledgeObjects: KnowledgeObject[];
  showObjects: boolean; 
}

@Component({
  selector: 'app-details-area',
  templateUrl: './details-area.component.html',
  styleUrls: ['./details-area.component.scss'],
  standalone: true
})
export class DetailsAreaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalogService = inject(CatalogService);
  private cdr = inject(ChangeDetectorRef);

  public areaId: string | null = null;
  public areaDetails: any = null;

  public competencies: Competency[] = [];
  public disciplines: Discipline[] = [];
  public isLoading: boolean = true;

  ngOnInit(): void {
    this.areaId = this.route.snapshot.paramMap.get('id');
    if (this.areaId) {
      this.fetchAreaDetails();
    }
  }

  private fetchAreaDetails(): void {
    this.catalogService.getAreas().subscribe({
      next: (res: any) => {
        const areas = res.data || [];
        this.areaDetails = areas.find((a: any) => a.id === this.areaId);

        if (this.areaDetails) {
          this.fetchCompetenciesAndSkills();
          this.fetchDisciplines();
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => console.error('Error fetching areas', err)
    });
  }

  private fetchCompetenciesAndSkills(): void {
    const areaCode = this.areaDetails.code; 

    forkJoin({
      competenciesRes: this.catalogService.getCompetencies({ area: areaCode }),
      skillsRes: this.catalogService.getSkills({ area: areaCode })
    }).subscribe({
      next: ({ competenciesRes, skillsRes }) => {
        const comps = competenciesRes.data || [];
        const skills = skillsRes.data || [];
        
        this.competencies = comps.map((c: any) => ({
          ...c,
          showSkills: false,
          skills: skills.filter((s: any) => s.competencyId === c.id)
        }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error fetching competencies/skills', err)
    });
  }

  private fetchDisciplines(): void {
    this.catalogService.getDisciplines({ areaId: this.areaId }).subscribe({
      next: (res: any) => {
        const discs = res.data || [];
        this.disciplines = discs.map((d: any) => ({
          ...d,
          showObjects: false,
          knowledgeObjects: []
        }));
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error fetching disciplines', err)
    });
  }

  public toggleSkills(competency: Competency): void {
    competency.showSkills = !competency.showSkills;
  }

  public toggleKnowledgeObjects(discipline: Discipline): void {
    discipline.showObjects = !discipline.showObjects;

    if (discipline.showObjects && discipline.knowledgeObjects.length === 0) {
      this.catalogService.getKnowledgeObjects({ disciplineId: discipline.id }).subscribe({
        next: (res: any) => {
          discipline.knowledgeObjects = res.data || [];
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error fetching knowledge objects', err)
      });
    }
  }
}