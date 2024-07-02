import { Injectable, OnModuleInit, Logger  } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { OpenAI    } from "openai";
import { ProductService } from '../product/services/product.service'; // Import ProductService
import { ProductDto } from '../product/dto/product.dto'; // Import ProductDto


@Injectable()
export class ChatGptBotService implements OnModuleInit {
  private readonly bot: TelegramBot;
  private readonly apiKey = process.env.CHATGPT_API_KEY;
  private readonly logger = new Logger(ChatGptBotService.name);
  private openai = new OpenAI({apiKey:this.apiKey});


  private conversationHistory: { role: string; content: string }[] = [];


  constructor(private readonly productService: ProductService) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

  }

  async getChatGptResponse(prompt: string): Promise<string> {
    this.logger.log('start sending prompt to ChatGPT:', prompt);

     // Add user message to conversation history
     this.conversationHistory.push({ role: 'user', content: prompt });

    try {

    const products = this.getProductsList();
    const stream = await this.openai.chat.completions.create({
      "messages": [
        { role: "system", content: "You are a helpful assistant and help to find Melika " },
        { role: "system", content: "Cayman token is new Ton jeton token." },
        { role: "system", content: "This bot is owned by 4Cash company." },
        { role: "system", content: "We are 4Cash company, providing excellent services in web3." },
        { role: "system", content: "Emad Panah is CTO in 4cash exchange" },
        {
        "role": "user",
        "content": prompt
        },
    ],
      model: "gpt-3.5-turbo-0125",
      //stream: true,
    });
  
    //completion
    const responseMessage = stream.choices[0].message.content.trim();
    this.conversationHistory.push({ role: 'assistant', content: responseMessage });
    this.logger.log(`Response from ChatGPT: ${responseMessage}`);
    return responseMessage  
    // Add assistant response to conversation history

    // stream
  // for await (const chunk of stream) {
  //   // this.logger.log(`Response from ChatGPT: ${chunk.choices[0].delta.content.trim()}`);
  //   process.stdout.write(chunk.choices[0]?.delta?.content || '');
  //   // return chunk.choices[0]?.delta?.content;
  // }
  
    } catch (error) {
      console.error('Error fetching response from ChatGPT:', error);
      return 'Error fetching response from ChatGPT.';
    }
  }

  async getProductsList(): Promise<ProductDto[]> {
    const products: ProductDto[] = await this.productService.getProducts();
    return products;//.map(product => `${product.name}: ${product.description}`).join('\n');
  }

  onModuleInit() {
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const userMessage = msg.text;
      console.log('Received message:', userMessage);

      // Check if the message contains predefined prompts
      // const predefinedPrompts = [
      //   "Tell me about Bitcoin.",
      //   "What is Ethereum?",
      //   "How does blockchain work?",
      //   // Add more prompts as needed
      // ];
      this.logger.log('Sending prompt to ChatGPT:', userMessage);
      let responseText = await this.getChatGptResponse(userMessage);

      // for (let prompt of predefinedPrompts) {
      //   if (userMessage.toLowerCase().includes(prompt.toLowerCase())) {
      //     console.log('Matched prompt:', prompt);
      //     responseText = await this.getChatGptResponse(prompt);
      //     break;
      //   }
      // }

      if (responseText === '') {
        console.log('No matching prompt found.');
        responseText = "I'm sorry, I can only answer questions about specific cryptocurrency topics.";
      }

      console.log('Sending response:', responseText);
      this.bot.sendMessage(chatId, responseText);
    });
  }
}


   