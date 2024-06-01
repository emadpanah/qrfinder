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
exports.IamRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const mongoose_3 = require("mongoose");
const iam_user_schema_1 = require("../schemas/iam-user.schema");
const uuid_1 = require("uuid");
let IamRepository = class IamRepository {
    constructor(iamUserModel, connection) {
        this.iamUserModel = iamUserModel;
        this.connection = connection;
    }
    createUser(ethAddress, walletType) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = (0, uuid_1.v4)();
            const newUser = new this.iamUserModel({
                ethAddress,
                userId,
                walletType,
                createdDate: new Date()
            });
            return newUser.save();
        });
    }
    findUserByAddress(ethAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundUser = yield this.iamUserModel.findOne({ ethAddress }).exec();
            if (!foundUser) {
                throw new Error('User not found by given address');
            }
            return foundUser;
        });
    }
};
exports.IamRepository = IamRepository;
exports.IamRepository = IamRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(iam_user_schema_1.IAMUser.name)),
    __param(1, (0, mongoose_2.InjectConnection)('service')),
    __metadata("design:paramtypes", [mongoose_3.Model,
        mongoose_3.Connection])
], IamRepository);
//# sourceMappingURL=iam.repository.js.map