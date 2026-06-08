import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '@services/catalog/catalog.service';
import { map, Observable } from 'rxjs';
import { UserSimulationsComponent } from "@components/user-simulations/user-simulations.component";
import { FooterComponent } from "@components/footer/footer.component";

export interface KnowledgeArea {
  id: string;
  code: string;
  name: string;
  icon: string;
}

interface ApiAreaItem {
  id: string;
  code: string;
  name: string;
  [key: string]: unknown;
}

interface ApiResponse {
  data: ApiAreaItem[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [RouterLink, AsyncPipe, UserSimulationsComponent, FooterComponent],
})
export class HomeComponent implements OnInit {
  private catalogService = inject(CatalogService);

  public knowledgeAreas$!: Observable<KnowledgeArea[]>;

  ngOnInit(): void {
    this.fetchAreas();
  }

  private fetchAreas(): void {
    this.knowledgeAreas$ = this.catalogService.getAreas().pipe(
      map((response: ApiResponse) => {
        const apiData = response.data || [];

        return apiData.map((area: ApiAreaItem) => ({
          id: area.id,
          code: area.code,
          name: area.name,
          icon: this.getAreaIcon(area.code)
        }));
      })
    );
  }

  private getAreaIcon(code: string): string {
    const icons: Record<string, string> = {
      'LC': 'language',
      'MT': 'calculate',
      'CH': 'public',
      'CN': 'eco'
    };
    return icons[code] || 'school';
  }
}