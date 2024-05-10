"use strict";
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
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const winston_1 = require("winston");
const nest_winston_1 = require("nest-winston");
const app_module_1 = require("./app.module");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = yield core_1.NestFactory.create(app_module_1.AppModule, {
            logger: nest_winston_1.WinstonModule.createLogger({
                level: 'info',
                format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
                transports: [
                    new winston_1.transports.Console(),
                    new winston_1.transports.File({
                        filename: 'logs/app.log',
                    }),
                    new winston_1.transports.File({
                        filename: 'logs/app-error.log',
                        level: 'error',
                    }),
                ],
            }),
        });
        app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
        yield app.listen(process.env.PORT);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map