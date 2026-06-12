import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2008 }, (_, i) => CURRENT_YEAR - i);

@Component({
  selector: 'app-exact-exam-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exact-exam-form.component.html',
  styleUrls: ['./exact-exam-form.component.scss'],
})
export class ExactExamFormComponent implements OnInit {
  @Output() payloadChange = new EventEmitter<any>();

  readonly years = YEARS;

  public type: 'REGULAR' | 'PPL' = 'REGULAR';
  public year = CURRENT_YEAR - 1;
  public day: 'D1' | 'D2' = 'D1';

  ngOnInit(): void { this.emit(); }

  setType(t: 'REGULAR' | 'PPL'): void { this.type = t; this.emit(); }
  setYear(y: number): void            { this.year = y; this.emit(); }
  setDay(d: 'D1' | 'D2'): void       { this.day  = d; this.emit(); }

  private emit(): void {
    this.payloadChange.emit({
      filters: { type: this.type, year: this.year, day: this.day },
    });
  }
}