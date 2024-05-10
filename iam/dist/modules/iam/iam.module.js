"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IamModule = void 0;
const common_1 = require("@nestjs/common");
const iam_controller_1 = require("./controllers/iam.controller");
const iam_service_1 = require("./services/iam.service");
const mongoose_1 = require("@nestjs/mongoose");
const iam_user_schema_1 = require("./database/schemas/iam-user.schema");
const iam_repository_1 = require("./database/repositories/iam.repository");
let IamModule = class IamModule {
};
exports.IamModule = IamModule;
exports.IamModule = IamModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: iam_user_schema_1.IAMUser.name, schema: iam_user_schema_1.IAMUserSchema },
            ], 'service'),
        ],
        controllers: [iam_controller_1.IamController],
        providers: [
            iam_service_1.IamService,
            iam_repository_1.IamRepository,
        ],
    })
], IamModule);
//# sourceMappingURL=iam.module.js.map