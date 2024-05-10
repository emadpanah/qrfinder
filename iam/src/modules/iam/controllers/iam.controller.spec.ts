import { Test, TestingModule } from '@nestjs/testing';
import { IamController } from './iam.controller';
import { IamService } from '../services/iam.service';
import { getModelToken } from '@nestjs/mongoose';
import { IAMUser, IAMUserSchema } from '../database/schemas/iam-user.schema';
import { UserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';

describe('IamController', () => {
  let iamController: IamController;
  let iamService: IamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IamController],
      providers: [
        IamService,
        {
          provide: getModelToken(IAMUser.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    iamController = module.get<IamController>(IamController);
    iamService = module.get<IamService>(IamService);
  });

  

  // describe('register', () => {
  //   it('should register a new user', async () => {
  //     // Arrange
  //     const username = 'testuser';
  //     const password = 'testpassword';
  //     const hashedPassword = await bcrypt.hash(password, 10);
  //     const userDto: UserDto = { username, password };

  //     // Mock the create method of the UserModel
  //     jest.spyOn(iamService, 'register').mockResolvedValueOnce({
  //       _id: 'someObjectId',
  //       username,
  //       password: hashedPassword,
  //     } as IAMUser);

  //     // Act
  //     await iamController.register(userDto);

  //     // Assert
  //     expect(iamService.register).toHaveBeenCalledWith(username, password);
  //   });
  // });

  // describe('login', () => {
  //   it('should return a JWT token for a valid user', async () => {
  //     // Arrange
  //     const username = 'testuser';
  //     const password = 'testpassword';
  //     const hashedPassword = await bcrypt.hash(password, 10);
  //     const userDto: UserDto = { username, password };

  //     // Mock the login method of the IamService to return a JWT token
  //     jest.spyOn(iamService, 'login').mockResolvedValueOnce('mockedJwtToken');

  //     // Act
  //     const result = await iamController.login(userDto);

  //     // Assert
  //     expect(result.token).toBe('mockedJwtToken');
  //     expect(iamService.login).toHaveBeenCalledWith(username, password);
  //   });

  //   it('should throw an error for an invalid user', async () => {
  //     // Arrange
  //     const username = 'invaliduser';
  //     const password = 'invalidpassword';
  //     const userDto: UserDto = { username, password };

  //     // Mock the login method of the IamService to throw an error
  //     jest.spyOn(iamService, 'login').mockRejectedValueOnce(new Error('Invalid credentials'));

  //     // Act & Assert
  //     await expect(iamController.login(userDto)).rejects.toThrow('Invalid credentials');
  //     expect(iamService.login).toHaveBeenCalledWith(username, password);
  //   });
  // });


  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(iamController.getHello()).toBe('Hello World!');
    });
  });



});
