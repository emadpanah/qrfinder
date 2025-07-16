import { Injectable, Logger } from '@nestjs/common';
import { KnowledgeItemRepository } from '../database/repositories/knowledge-item.repository';
import { KnowledgeItemDto } from '../database/dto/knowledge-item.dto';

@Injectable()
export class KnowledgeItemService {
  private readonly logger = new Logger(KnowledgeItemService.name);

  constructor(
    private readonly repo: KnowledgeItemRepository
  ) {}

  async createPrompt(dto: KnowledgeItemDto) {
    return await this.repo.create(dto);
  }

  async getPromptList(limit = 20): Promise<KnowledgeItemDto[]> {
    const all = await this.repo.list();
    return all.slice(0, limit);
  }

  async updatePromptByQuestion(question: string, newAnswer: string) {
    const item = await this.repo.findByQuestion(question);
    if (!item || !item._additional?.id) {
      throw new Error('Prompt not found');
    }
    return await this.repo.update(item._additional.id, { answer: newAnswer });
  }

  async deletePromptByQuestion(question: string) {
    const item = await this.repo.findByQuestion(question);
    if (!item || !item._additional?.id) {
      throw new Error('Prompt not found');
    }
    return await this.repo.deleteById(item._additional.id);
  }
}
