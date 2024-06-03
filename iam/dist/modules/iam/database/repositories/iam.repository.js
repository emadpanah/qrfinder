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
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
let IamRepository = class IamRepository {
    constructor(connection) {
        this.connection = connection;
    }
    createUser(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.connection.collection('_iamusers');
            const userId = (0, uuid_1.v4)();
            yield collection.insertOne({
                ethAddress: dto.ethAddress,
                walletType: dto.walletType,
                createdDate: new Date().toISOString(),
            });
            const user = yield collection.findOne({ ethAddress: dto.ethAddress });
            if (!user) {
                throw new Error('Insert not completed.');
            }
            return user;
        });
    }
    findUserByAddress(EthAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.connection.collection('_iamusers');
            const user = yield collection.findOne({ ethAddress: EthAddress });
            return user;
        });
    }
};
exports.IamRepository = IamRepository;
exports.IamRepository = IamRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)('service')),
    __metadata("design:paramtypes", [mongoose_2.Connection])
], IamRepository);
//# sourceMappingURL=iam.repository.js.map