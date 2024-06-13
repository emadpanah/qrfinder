"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IamModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const iam_controller_1 = require("./controllers/iam.controller");
const iam_service_1 = require("./services/iam.service");
const iam_repository_1 = require("./database/repositories/iam.repository");
const user_login_repository_1 = require("./database/repositories/user-login.repository");
const iam_user_schema_1 = require("./database/schemas/iam-user.schema");
const user_login_schema_1 = require("./database/schemas/user-login.schema");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let IamModule = class IamModule {
};
exports.IamModule = IamModule;
exports.IamModule = IamModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            mongoose_1.MongooseModule.forFeature([
                { name: iam_user_schema_1.IAMUser.name, schema: iam_user_schema_1.IAMUserSchema },
                { name: user_login_schema_1.UserLogin.name, schema: user_login_schema_1.UserLoginSchema },
            ], 'service'),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => __awaiter(void 0, void 0, void 0, function* () {
                    return ({
                        secret: configService.get('APP_SECRET'),
                        signOptions: { expiresIn: '1h' },
                    });
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [iam_controller_1.IamController],
        providers: [
            iam_service_1.IamService,
            iam_repository_1.IamRepository,
            user_login_repository_1.UserLoginRepository,
            jwt_auth_guard_1.JwtAuthGuard,
        ],
    })
], IamModule);
//# sourceMappingURL=iam.module.js.map