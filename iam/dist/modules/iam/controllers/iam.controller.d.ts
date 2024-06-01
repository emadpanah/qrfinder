import { IamService } from '../services/iam.service';
import { UserDto } from '../dto/user.dto';
import { UserLogin } from '../database/schemas/user-login.schema';
export declare class IamController {
    private readonly iamService;
    constructor(iamService: IamService);
    register(body: UserDto): Promise<{
        token: string;
    }>;
    getHello(): string;
    getUserLoginHistory(ethAddress: string): Promise<UserLogin[]>;
}
