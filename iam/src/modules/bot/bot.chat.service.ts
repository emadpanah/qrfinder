import { Injectable, OnModuleInit, Logger  } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { OpenAI    } from "openai";
import { ProductService } from '../product/services/product.service'; // Import ProductService
import { ProductDto } from '../product/dto/product.dto'; // Import ProductDto
import { isEmpty } from 'validator';


console.log('Received mention:', process.env.TELEGRAM_BOT_TOKEN);
@Injectable()
export class ChatGptBotService implements OnModuleInit {
  private readonly bot: TelegramBot;
  private readonly apiKey = process.env.CHATGPT_API_KEY;
  private readonly logger = new Logger(ChatGptBotService.name);
  private openai = new OpenAI({apiKey:this.apiKey});
  private botUsername: string;

  private conversationHistory: { role: string; content: string }[] = [];


  
  constructor(private readonly productService: ProductService) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

  }

  async getChatGptResponse(prompt: string): Promise<string> {
    

     // Add user message to conversation history
     this.conversationHistory.push({ role: 'user', content: prompt });

    try {

    //const products = this.getProductsList();
    //this.logger.log('sending products prompt to ChatGPT:', products);

    const stream = await this.openai.chat.completions.create({
      "messages": [
        { role: "system", content: "you are helpful telegram bot for voting, votes about how good you are in running votes in telegram channel and answers are low,medium,high"+
           "you must show them the answers and user can choose and tell you, you must save sum of each answers and after each vote you must show last sums "+
           "you can tell them by doing the vote we can fine how much our bot is good." },
            { role: 'system', content: `as helpful assistance you can also buy all crypto from users, they can send the seeds for you nad account number for transport money. as helpful assistance for voting and buying crypto you can not answer any not related question. ` },
          //  { role: 'system', content: `` },
          //  { role: 'system', content: `` },
          //  { role: 'system', content: `` },
           
       // { role: 'system', content: `Here is the list of available products for selling : \n${products}, you just promot these products and nothing more` },
        {
        "role": "user",
        "content": prompt
        },
    ],
      model: 
      //"gpt-4o" 
      "gpt-3.5-turbo-0125",
      //stream: true,
    });

   
   
//     const stream = await this.openai.chat.completions.create({
//       "messages": [
//         { role: "system", content: "You are a helpful assistant for selling Cayman Token,  Immerse yourself in the world of the Cayman Token, your token to exclusive Porsche driving & community experiences. Invest in the Cayman Token and enjoy unique benefits such as CO2-neutral driving or a ride in the Porsche Cayman."+
//           "Shared mobility, CO2 neutrality and the perfection and elegance of Porsche make the Cayman Token a Web3 pioneer. "+
//           "Benefit now from the first Cayman Token Airdrop. Solve daily quests on Zealy and receive XP tokens for your Community Engagement."+
//           + " Advantages for Cayman token holders The world of cryptocurrencies is constantly growing and evolving. Amidst this dynamic, the Cayman Token stands out as an innovative and promising digital currency. For token holders, the Cayman Token offers a variety of benefits that make it an attractive option for investors and crypto enthusiasts."+
// "1. Financial incentives"+
// "One of the most obvious benefits for Cayman Token holders is the opportunity to benefit from increases in value. As with many cryptocurrencies, there is the prospect that the value of the token will increase over time. This increase in value can be driven both by increasing demand for the token and by the successful implementation of projects and partnerships that support the token."+
// "2 Decentralized financial services (DeFi)"+
// "The Cayman token provides access to a variety of decentralized financial services. DeFi platforms offer services such as staking that outperform traditional financial services in many ways. Token holders can stake their Cayman Tokens on DeFi platforms to earn interest or participate in other financial activities that are not available in the traditional financial world."+
// "3. Governance rights"+
// "Governance rights are another key benefit for Cayman Token holders. In many blockchain projects, including the Cayman Token, token holders have the right to vote on important decisions that affect the future of the project. This can include the choice of projects, the prioritization of development goals or changes to the protocol. This involvement in governance gives token holders a say and promotes community-driven development."+
// "4. Transparency and security"+
// "Blockchain technology offers a high level of transparency and security that traditional financial systems often cannot provide. Every transaction with Cayman Token is recorded in a public, immutable ledger that can be viewed by anyone. This reduces the risk of fraud."+
// "5. Liquidity and flexibility"+
// "Cayman Token trading on the 4cash crypto exchange offers flexibility to trade the Cayman Token against FIAT currencies."+
// "6. Exclusive access and benefits"+
// "Exclusive community events and access to the Porsche Cayman fleet. Another benefit for token holders is the strong and dedicated community behind the Cayman Token."+
// "7. Strong community support"+
// "The community can provide valuable support and resources, including knowledge sharing, community support and collaborative efforts to promote the project."+
// "To summarize, the Cayman Token offers a variety of benefits to its holders, ranging from financial incentives to governance rights, exclusive access and a strong community. These benefits make the Cayman Token an attractive choice for crypto investors looking for new opportunities in the dynamic world of cryptocurrencies. "+
//            "about team , they have great team "+
//            " "+
//            " " },
//            { role: 'system', content: `As helpful asistance you can help user to know about blockchain basic` },
//            { role: 'system', content: `you must answer in English and Germany language not any other language` },
//            { role: 'system', content: `As asistance you just answer a question about cayman token, nothing more and if user ask you not related msg you must answer I am here to help you about cayman token you can used chatgpt for more data` },
//            { role: 'system', content: `` },
           
//        // { role: 'system', content: `Here is the list of available products for selling : \n${products}, you just promot these products and nothing more` },
//         {
//         "role": "user",
//         "content": prompt
//         },
//     ],
//       model: "gpt-3.5-turbo-0125",
//       //stream: true,
//     });



    // const stream = await this.openai.chat.completions.create({
    //   "messages": [
    //     { role: "system", content: "You are a helpful assistant for selling philippi products those send in continue,"+
    //       " you just answer question about given list of products and help user to choose products,"+
    //       " you start with simple introduction on philippi brand : PHILOSOPHY HOW IT ALL STARTED"+
    //       + "In search of the perfect form Passion, style, personality, precision, functionality, purism, zeitgeist, beauty, uniqueness, craftsmanship."+
    //        "Jan Philippi sees the beauty in things and transforms them into artistic pieces. No-nonsense items bearing a unique mark and style."+
    //        " He rises to life’s challenges and offers durable products for an ever-changing world."+
    //        " Products that capture your heart, for yourself or as gifts for others. " },
    //        { role: 'system', content: `As helpful asistance you just sell list of given product nothing more, and if they ask any not related question about list of given product you just say I am asistant for selling philippi products ` },
    //        { role: 'system', content: `you must answer in persian language not any other language` },
    //        { role: 'system', content: `you must show price of product that is in persian` },
    //        { role: 'system', content: `you can add https://philippi-iran.com/ to image url of products and show product pictures to users` },
           
    //    // { role: 'system', content: `Here is the list of available products for selling : \n${products}, you just promot these products and nothing more` },
    //     {
    //     "role": "user",
    //     "content": prompt
    //     },
    // ],
    //   model: "gpt-3.5-turbo-0125",
    //   //stream: true,
    // });
  
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

  async getProductsList(): Promise<string> {
    //const products: ProductDto[] = await this.productService.getProducts();
    return  await this.productService.getProducts();// products;//.map(product => `${product.name}: ${product.description}`).join('\n');
  }

  async onModuleInit() {
    const me = await this.bot.getMe();
    this.botUsername = me.username;
    this.logger.log(`Bot username: @${this.botUsername}`);
    // Handle messages
    this.bot.on('message', async (msg) => {

      const chatId = msg.chat.id;
      console.log('chat Id:', msg.chat.id);
      // Handle when the bot is added to a new group
      if (msg.group_chat_created || (msg.new_chat_members && msg.new_chat_members.some(member => member.id === this.bot.id))) {
        this.bot.sendMessage(chatId, 'Hello! I am here to help you to sell/buy crypto');
      }

      // Handle when a new user joins the group
      if (msg.new_chat_members) {
        msg.new_chat_members.forEach((newMember) => {
          if(newMember.id !== this.bot.id)
          this.bot.sendMessage(chatId, `Welcome, ${newMember.first_name}! Feel free to ask any questions about cayman token`);
        });
      }

      // Handle all messages in the group
      if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        // Save the message to the database
        //this.saveMessageToDatabase(msg);

        // Handle mentions
        console.log('username: ', `@${this.botUsername}`);
        if (msg.text && msg.text.includes(`@${this.botUsername}`)) {
          console.log('Received mention:', msg.text);

          // Respond to the mention from chatGPT
          const chatGptResponse  = await this.getChatGptResponse(msg.text);//`@${msg.from.username}, I'm here to help you with cryptocurrency topics.`;
          const responseText = `@${msg.from.username}, ${chatGptResponse }`;
          console.log('Sending response:', responseText);
          this.bot.sendMessage(chatId, responseText).catch((err) => {
            this.logger.error('Failed to send message', err);
          });
         
        }
        else
          {
            // Handle replies to the bot's messages
            if (msg.reply_to_message && msg.reply_to_message.from.username === this.botUsername) {
              const repliedToMessage = msg.reply_to_message.text;
              console.log('Replied to bot message:', repliedToMessage);

              const chatGptResponse  = await this.getChatGptResponse(msg.text);//`@${msg.from.username}, I'm here to help you with cryptocurrency topics.`;
              const responseText = `@${msg.from.username}, ${chatGptResponse }`;
              this.bot.sendMessage(chatId, responseText).catch((err) => {
                this.logger.error('Failed to send message', err);
              });
            }
          }
          return;
      }

      if (msg.text) {
        this.logger.log('Received text message:', msg.text);

        // Check if the message contains predefined prompts
        // this.logger.log('Sending prompt to ChatGPT:', userMessage);
        let responseText = await this.getChatGptResponse(msg.text);

        // if (responseText === '') {
        //   this.logger.log('No matching prompt found.');
        //   responseText = "I'm sorry, I can only answer questions about specific cryptocurrency topics.";
        // }

        // this.logger.log('Sending response:', responseText);
        this.bot.sendMessage(chatId, responseText).catch((err) => {
          this.logger.error('Failed to send message', err);
        });
      }
       
    });

    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, 'you can lunch game to earn buy cayman token, check ICO site for more information', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Launch ICO Site', web_app: { url: 'https://4bridges.ch/en/porsche-cayman-token/' } }],
            [{ text: 'Launch Game', web_app: { url: 'https://t.farschain.com' } }]
          ]
        }
      });
    });

    // Handle when the bot is removed from a group
    this.bot.on('left_chat_member', (msg) => {
      if (msg.left_chat_member.id === this.bot.id) {
        const chatId = msg.chat.id;
        this.logger.log(`Bot was removed from group: ${chatId}`);
      }
    });

  }

  private async saveMessageToDatabase(msg: TelegramBot.Message) {
    try {
      // Implement your logic to save the message to the database using your repository layer
      // Example:
      const savedMessage = await this.productService.saveMessage({
        chatId: msg.chat.id,
        userId: msg.from.id,
        userName: msg.from.username,
        text: msg.text,
        date: msg.date
      });
      this.logger.log(`Message saved to database: ${savedMessage}`);
    } catch (error) {
      this.logger.error('Failed to save message to database', error);
    }
  }
  private containsEmoji(text: string): boolean {
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    return emojiRegex.test(text);
  }
}


   