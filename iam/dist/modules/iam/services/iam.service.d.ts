import { IamRepository } from '../database/repositories/iam.repository';
import { UserDto } from '../dto/user.dto';
export declare class IamService {
    private readonly iamRepository;
    private readonly tokenSecret;
    constructor(iamRepository: IamRepository);
    private hashPassword;
    register(dto: UserDto): Promise<UserDto>;
    login(dto: UserDto): Promise<string>;
    getHello(): string;
}
