
export class UserChatLogDto {
    telegramId: string;
    query: string;
    response: string;
    calledFunction?: string;
    parameters?: Record<string, any>;
    newParameters?: Record<string, any>;
    queryType: string;
    save_at: number; // Unix timestamp
  }
  