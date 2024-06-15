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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.IamController = void 0;
const common_1 = require("@nestjs/common");
const iam_service_1 = require("../services/iam.service");
const user_dto_1 = require("../dto/user.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const common_2 = require("@nestjs/common");
let IamController = class IamController {
    constructor(iamService) {
        this.iamService = iamService;
        this.logger = new common_2.Logger(iam_service_1.IamService.name);
    }
    register(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.log(`Attempting to register or login user with address:`);
                const token = yield this.iamService.registerOrLogin(body);
                return { token };
            }
            catch (error) {
                throw error;
            }
        });
    }
    getHello() {
        return this.iamService.getHello();
    }
    getUserLoginHistory(ethAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.iamService.getUserLoginHistory(ethAddress);
        });
    }
};
exports.IamController = IamController;
__decorate([
    (0, common_1.Post)('/register'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UserInsertDto]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('/getHello'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], IamController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('/loginHistory/:ethAddress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('ethAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "getUserLoginHistory", null);
exports.IamController = IamController = __decorate([
    (0, common_1.Controller)('iam'),
    __metadata("design:paramtypes", [iam_service_1.IamService])
], IamController);
//# sourceMappingURL=iam.controller.js.map