import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { ChatGptBotService } from './bot.chat.service';
import { ProductModule } from '../product/product.module'; 

@Module({
  imports: [ProductModule],
  providers: [BotService, 
    //ChatGptBotService
    ],
})
export class BotModule {}
