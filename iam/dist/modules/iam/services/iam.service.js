"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.IamService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const iam_repository_1 = require("../database/repositories/iam.repository");
const user_login_repository_1 = require("../database/repositories/user-login.repository");
const auth_service_1 = require("./auth.service");
const jsonwebtoken_1 = require("jsonwebtoken");
let IamService = class IamService {
    constructor(iamRepository, userLoginRepository, authService) {
        this.iamRepository = iamRepository;
        this.userLoginRepository = userLoginRepository;
        this.authService = authService;
        this.tokenSecret = process.env.JWT_SECRET;
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt.genSalt(10);
            return bcrypt.hash(password, salt);
        });
    }
    registerOrLogin(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(process.env.NEXT_PUBLIC_APP_SECRET);
                console.log(dto.clientSecret);
                if (process.env.NEXT_PUBLIC_APP_SECRET != dto.clientSecret)
                    throw new common_1.UnauthorizedException();
                console.log('register');
                const user = yield this.iamRepository.findUserByAddress(dto.ethAddress);
                if (user) {
                    console.log('old user');
                    const existingLoginInfo = yield this.userLoginRepository.findLatestLoginByEthAddress(dto.ethAddress);
                    if (existingLoginInfo) {
                        try {
                            console.log('existingLoginInfo : ' + existingLoginInfo.token);
                            yield this.authService.verifyJwt(existingLoginInfo.token, existingLoginInfo.ethAddress);
                            return existingLoginInfo.token;
                        }
                        catch (error) {
                            if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                                console.log('Token expired, generating new token');
                                const newToken = yield this.authService.generateJwt(dto.ethAddress);
                                console.log(newToken);
                                yield this.userLoginRepository.createLogin(dto.ethAddress, newToken);
                                return newToken;
                            }
                            else {
                                throw error;
                            }
                        }
                    }
                    console.log('new token');
                    const newToken = yield this.authService.generateJwt(dto.ethAddress);
                    yield this.userLoginRepository.createLogin(dto.ethAddress, newToken);
                    return newToken;
                }
                console.log('new user');
                yield this.iamRepository.createUser(dto);
                const token = yield this.authService.generateJwt(dto.ethAddress);
                yield this.userLoginRepository.createLogin(dto.ethAddress, token);
                return token;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getUserLoginHistory(ethAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userLoginRepository.findLoginHistoryByEthAddress(ethAddress);
        });
    }
    getHello() {
        return 'Hello World!';
    }
};
exports.IamService = IamService;
exports.IamService = IamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [iam_repository_1.IamRepository,
        user_login_repository_1.UserLoginRepository, auth_service_1.AuthService])
], IamService);
//# sourceMappingURL=iam.service.js.map