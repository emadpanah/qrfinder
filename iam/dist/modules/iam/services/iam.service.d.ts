import { UserLogin } from '../database/schemas/user-login.schema';
import { IamRepository } from '../database/repositories/iam.repository';
import { UserLoginRepository } from '../database/repositories/user-login.repository';
import { UserInsertDto } from '../dto/user.dto';
import { AuthService } from './auth.service';
export declare class IamService {
    private readonly iamRepository;
    private readonly userLoginRepository;
    private readonly authService;
    private readonly tokenSecret;
    constructor(iamRepository: IamRepository, userLoginRepository: UserLoginRepository, authService: AuthService);
    private hashPassword;
    registerOrLogin(dto: UserInsertDto): Promise<string>;
    getUserLoginHistory(ethAddress: string): Promise<UserLogin[]>;
    getHello(): string;
}
