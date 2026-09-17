import { Injectable, inject } from '@angular/core';
import { ImagesService } from '@services/images/images.service';

export type ContentType = 'TEXT' | 'IMAGE';

export interface AlternativeView {
  id: string;
  letter: string;
  type: ContentType;
  text: string | null;
  imageUrl: string | null;
}

export interface QuestionBlockView {
  id: string;
  type: ContentType;
  text: string | null;
  imageUrl: string | null;
}

export interface QuestionView {
  id: string;
  number: number;
  area: string;
  statement: string | null;
  blocks: QuestionBlockView[];
  alternatives: AlternativeView[];
}

@Injectable({ providedIn: 'root' })
export class QuestionContentService {
  private images = inject(ImagesService);

  public toView(question: any): QuestionView {
    const statement: string | null = question?.rawJson?.comando ?? null;

    return {
      id: question.id,
      number: question.number,
      area: question.area ?? 'Geral',
      statement,
      blocks: this.buildBlocks(question, statement),
      alternatives: this.buildAlternatives(question),
    };
  }

  public buildBlocks(question: any, statement: string | null): QuestionBlockView[] {
    const blocks: any[] = question?.blocks ?? [];

    return blocks
      .filter((block) => !(block.type === 'TEXT' && block.text === statement))
      .map((block) => ({
        id: block.id,
        type: block.type === 'IMAGE' ? 'IMAGE' : 'TEXT',
        text: block.type === 'IMAGE' ? null : (block.text ?? null),
        imageUrl:
          block.type === 'IMAGE'
            ? this.images.buildUrl(block.imageUrl ?? block.text)
            : null,
      }));
  }


  public buildAlternatives(question: any): AlternativeView[] {
    const rawAlternatives: Record<string, any> =
      question?.rawJson?.alternativas ?? {};

    return (question?.alternatives ?? []).map((alternative: any) => {
      const raw = rawAlternatives[alternative.letter];
      const isImage = raw?.tipo === 'image';

      return {
        id: alternative.id,
        letter: alternative.letter,
        type: isImage ? 'IMAGE' : 'TEXT',
        text: isImage
          ? null
          : (raw?.conteudo_formatado ?? raw?.conteudo ?? alternative.text ?? ''),
        imageUrl: isImage
          ? this.images.buildUrl(raw?.image_path ?? raw?.conteudo ?? alternative.text)
          : null,
      };
    });
  }
}