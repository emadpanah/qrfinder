import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { KnowledgeItemDto } from '../dto/knowledge-item.dto';

@Injectable()
export class KnowledgeItemRepository {
  private readonly baseUrl = 'http://172.86.95.166:8080/v1';
  private readonly logger = new Logger(KnowledgeItemRepository.name);

  async create(item: KnowledgeItemDto) {
    const body = {
      class: 'KnowledgeItem',
      properties: {
        question: item.question,
        answer: item.answer,
      },
    };

    try {
      const res = await axios.post(`${this.baseUrl}/objects`, body, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data;
    } catch (err) {
      this.logger.error('Error creating KnowledgeItem in Weaviate', err);
      throw err;
    }
  }

  async list(): Promise<KnowledgeItemDto[]> {
    try {
      const res = await axios.post(`${this.baseUrl}/graphql`, {
        query: `{
          Get {
            KnowledgeItem {
              question
              answer
            }
          }
        }`,
      });
      return res.data.data.Get.KnowledgeItem;
    } catch (err) {
      this.logger.error('Error fetching KnowledgeItems', err);
      throw err;
    }
  }

  async findByQuestion(question: string): Promise<any | null> {
    const query = `
    {
      Get {
        KnowledgeItem(
          where: {
            path: ["question"]
            operator: Equal
            valueText: "${question}"
          }
        ) {
          question
          answer
          _additional { id }
        }
      }
    }`;

    try {
      const res = await axios.post(`${this.baseUrl}/graphql`, { query });
      return res.data.data.Get.KnowledgeItem?.[0] || null;
    } catch (err) {
      this.logger.error('Error finding KnowledgeItem by question', err);
      throw err;
    }
  }

  async deleteById(uuid: string) {
    try {
      const res = await axios.delete(`${this.baseUrl}/objects/KnowledgeItem/${uuid}`);
      return res.data;
    } catch (err) {
      this.logger.error('Error deleting KnowledgeItem', err);
      throw err;
    }
  }

  async update(uuid: string, item: Partial<KnowledgeItemDto>) {
    try {
      const res = await axios.put(`${this.baseUrl}/objects/KnowledgeItem/${uuid}`, {
        class: 'KnowledgeItem',
        properties: item,
      });
      return res.data;
    } catch (err) {
      this.logger.error('Error updating KnowledgeItem', err);
      throw err;
    }
  }
}
