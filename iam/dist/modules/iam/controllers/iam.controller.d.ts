import { IamService } from '../services/iam.service';
import { UserInsertDto } from '../dto/user.dto';
import { UserLogin } from '../database/schemas/user-login.schema';
export declare class IamController {
    private readonly iamService;
    private readonly logger;
    constructor(iamService: IamService);
    register(body: UserInsertDto): Promise<{
        token: string;
    }>;
    getHello(): string;
    getUserLoginHistory(ethAddress: string): Promise<UserLogin[]>;
}
