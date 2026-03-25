"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const swagger_config_1 = require("./config/swagger.config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)());
    app.use((0, cookie_parser_1.default)());
    const corsOrigins = configService.get('cors.origins');
    app.enableCors({
        origin: corsOrigins[0] === '*' ? '*' : corsOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    const apiPrefix = configService.get('apiPrefix');
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    const document = swagger_1.SwaggerModule.createDocument(app, swagger_config_1.swaggerConfig);
    swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document, swagger_config_1.swaggerOptions);
    const port = process.env.PORT || configService.get('port') || 3000;
    await app.listen(port);
    const pgAdminEmail = configService.get('pgAdmin.email');
    const pgAdminPassword = configService.get('pgAdmin.password');
    const pgAdminPort = configService.get('pgAdmin.port');
    console.log('\n');
    console.log(' ==================================');
    console.log(`✅ Application is running on: http://localhost:${port}/${apiPrefix}`);
    console.log(`✅ Swagger docs: http://localhost:${port}/${apiPrefix}/docs`);
    console.log(`✅ pgAdmin: http://localhost:${pgAdminPort} (email: ${pgAdminEmail} / password: ${pgAdminPassword})`);
    console.log(`✅ Environment: ${configService.get('nodeEnv')}`);
    console.log(`✅ CORS: ${corsOrigins[0] === '*' ? 'all origins' : corsOrigins.join(', ')}`);
    console.log(' ==================================');
    console.log('\n');
}
bootstrap();
//# sourceMappingURL=main.js.map