import { UserLogin } from '../database/schemas/user-login.schema';
import { IamRepository } from '../database/repositories/iam.repository';
import { UserLoginRepository } from '../database/repositories/user-login.repository';
import { UserInsertDto } from '../dto/user.dto';
export declare class IamService {
    private readonly iamRepository;
    private readonly userLoginRepository;
    private readonly tokenSecret;
    constructor(iamRepository: IamRepository, userLoginRepository: UserLoginRepository);
    private hashPassword;
    registerOrLogin(dto: UserInsertDto): Promise<string>;
    private isTokenValid;
    getUserLoginHistory(ethAddress: string): Promise<UserLogin[]>;
    getHello(): string;
}
