export class SupportChatLogDto {
  userId: string;
  telegramId: string;
  chatId: string;
  query: string;
  response: string;
  calledFunction?: string;
  parameters?: Record<string, any>;
  newParameters?: Record<string, any>;
  save_at: number;

  conversationId?: string;
  isResolved?: boolean;
  resolutionNote?: string;
  tags?: string[];
  source?: 'telegram' | 'web' | 'email' | 'whatsapp';
  rating?: number;
}
