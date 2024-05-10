"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpLoggerInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpLoggerInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let HttpLoggerInterceptor = HttpLoggerInterceptor_1 = class HttpLoggerInterceptor {
    constructor() {
        this.logger = new common_1.Logger(HttpLoggerInterceptor_1.name);
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const start = Date.now();
        return next.handle().pipe((0, operators_1.tap)((data) => {
            const elapsed = Date.now() - start;
            this.logger.log({
                method: req.method,
                url: req.url,
                status: res.statusCode,
                body: req.body,
                response: data,
                resposeTime: `${elapsed}ms`,
            });
        }));
    }
};
exports.HttpLoggerInterceptor = HttpLoggerInterceptor;
exports.HttpLoggerInterceptor = HttpLoggerInterceptor = HttpLoggerInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], HttpLoggerInterceptor);
//# sourceMappingURL=http-logger.interceptor.js.map