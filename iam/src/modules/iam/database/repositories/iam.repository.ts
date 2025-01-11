// iam/database/repositories/iam.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { UserDto, UserInsertDto } from '../../dto/user.dto';
import { sanitizeString } from 'src/shared/helper';

@Injectable()
export class IamRepository {
  constructor(@InjectConnection('service') private connection: Connection) {}

  async createUser(dto: UserInsertDto): Promise<any> {
    const collection = this.connection.collection('_iamusers');

    // Validate and sanitize input
    const sanitizedData = {
      telegramID: sanitizeString(dto.telegramID, 50),
      mobile: sanitizeString(dto.mobile, 15),
      telegramUserName: sanitizeString(dto.telegramUserName, 50),
      telegramFirstName: sanitizeString(dto.telegramFirstName, 50),
      telegramLastName: sanitizeString(dto.telegramLastName, 50),
      telegramLanCode: sanitizeString(dto.telegramLanCode, 10),
      createdDate: Date.now(),
    };

    await collection.insertOne(sanitizedData);

    const user = await collection.findOne({ telegramID: sanitizedData.telegramID });
    if (!user) {
      throw new Error('User insert not completed.');
    }
    return user;
  }

  async setUserAlias(telegramID: string, alias: string): Promise<any> {
    try {
      const sanitizedTelegramID = sanitizeString(telegramID, 50);
      const sanitizedAlias = sanitizeString(alias, 100);

      const collection = this.connection.collection('_iamusers');

      const result = await collection.updateOne(
        { telegramID: sanitizedTelegramID },
        { $set: { alias: sanitizedAlias } }
      );

      if (result.matchedCount === 0) {
        throw new Error(`User with telegramID ${sanitizedTelegramID} not found.`);
      }

      const ret = await collection.findOne({ telegramID: sanitizedTelegramID });
      return ret;
    } catch (error) {
      console.log('Failed to set user alias:', error);
      throw new Error('Failed to set user alias.');
    }
  }

  async updateUser(telegramID: string, username?: string, mobile?: string): Promise<any> {
    const sanitizedTelegramID = sanitizeString(telegramID, 50);

    const collection = this.connection.collection('_iamusers');

    // Build the update object dynamically with sanitized fields
    const updateFields: any = {};
    if (username !== undefined && username !== null) {
      updateFields.telegramUserName = sanitizeString(username, 50);
    }
    if (mobile !== undefined && mobile !== null) {
      updateFields.mobile = sanitizeString(mobile, 15);
    }

    const result = await collection.updateOne(
      { telegramID: sanitizedTelegramID },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      throw new Error(`User with telegramID ${sanitizedTelegramID} not found.`);
    }
    const ret = await collection.findOne({ telegramID: sanitizedTelegramID });
    return ret;
  }

  async findUserByTelegramID(telegramId: string): Promise<any> {
    const sanitizedTelegramID = sanitizeString(telegramId, 50);
    const collection = this.connection.collection('_iamusers');
    const user = await collection.findOne({ telegramID: sanitizedTelegramID });
    return user;
  }

  async findUserById(id: Types.ObjectId): Promise<any> {
    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }

    const collection = this.connection.collection('_iamusers');
    const user = await collection.findOne({ _id: id });
    return user;
  }
}


// // iam/database/repositories/iam.repository.ts
// import { Injectable, Type } from '@nestjs/common';
// import { InjectConnection } from '@nestjs/mongoose';
// import { Connection, Types } from 'mongoose';
// import { UserDto, UserInsertDto } from '../../dto/user.dto';
// import { sanitizeString } from 'src/shared/helper';

// @Injectable()
// export class IamRepository {
//   constructor(@InjectConnection('service') private connection: Connection) { }

//   async createUser(dto: UserInsertDto): Promise<any> {
//     const collection = this.connection.collection('_iamusers');

//     await collection.insertOne({
//       telegramID: dto.telegramID,
//       mobile: dto.mobile,
//       telegramUserName: dto.telegramUserName,
//       telegramFirstName: dto.telegramFirstName,
//       telegramLastName: dto.telegramLastName,
//       telegramLanCode: dto.telegramLanCode,
//       createdDate: Date.now(),
//     });
//     const user = await collection.findOne({ telegramID: dto.telegramID });
//     if (!user) {
//       // Handle the case where the agent is not found
//       throw new Error('User insert not completed.');
//     }
//     // Return the inserted document
//     return user;
//   }

//   async setUserAlias(telegramID: string, alias: string): Promise<any> {
//     try {
//       const sanitizedAlias = sanitizeString(alias, 100);
//       const collection = this.connection.collection('_iamusers');

//       const result = await collection.updateOne(
//         { telegramID: telegramID },
//         { $set: { alias: sanitizedAlias } }
//       );

//       if (result.matchedCount === 0) {
//         throw new Error(`User with telegramID ${telegramID} not found.`);
//       }

//       const ret = await collection.findOne({ telegramID: telegramID });
//       return ret;
      
//     } catch (error) {
//       console.log('Failed to set user alias : ', error);
//       throw new Error('Failed to set user alias.');
//     }
//   }

//   async updateUser(telegramID: string, username?: string, mobile?: string): Promise<any> {
//     const collection = this.connection.collection('_iamusers');

//     // Build the update object dynamically
//     const updateFields: any = {};
//     if (username !== undefined && username !== null) {
//       updateFields.telegramUserName = username;
//     }
//     if (mobile !== undefined && mobile !== null) {
//       updateFields.mobile = mobile;
//     }

//     const result = await collection.updateOne(
//       { telegramID: telegramID },
//       { $set: updateFields }
//     );

//     if (result.matchedCount === 0) {
//       throw new Error(`User with telegramID ${telegramID} not found.`);
//     }
//     const ret = await collection.findOne({ telegramID: telegramID });

//     return ret;
//   }


//   async findUserByTelegramID(telegramId: string): Promise<any> {
//     const collection = this.connection.collection('_iamusers');
//     const user = await collection.findOne({ telegramID: telegramId });
//     // Return the inserted document
//     return user;
//   }

//   async findUserById(id: Types.ObjectId): Promise<any> {
//     const collection = this.connection.collection('_iamusers');
//     console.log('findUserById - ', id);
//     const user = await collection.findOne({ _id: id });
//     // Return the inserted document
//     return user;
//   }
// }
