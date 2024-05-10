import { IamService } from '../services/iam.service';
import { UserDto } from '../dto/user.dto';
export declare class IamController {
    private readonly iamService;
    constructor(iamService: IamService);
    register(body: UserDto): Promise<UserDto>;
    login(body: UserDto): Promise<{
        token: string;
    }>;
    getHello(): string;
}
