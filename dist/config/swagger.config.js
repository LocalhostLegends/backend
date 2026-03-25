"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerOptions = exports.swaggerConfig = void 0;
const swagger_1 = require("@nestjs/swagger");
exports.swaggerConfig = new swagger_1.DocumentBuilder()
    .setTitle('HR Tech Portal API')
    .setDescription(``)
    .setVersion('1.0.0')
    .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'JWT',
    description: 'Enter JWT token',
    in: 'header',
}, 'JWT-auth')
    .addServer('http://localhost:3175/api', 'Development server')
    .addServer('https://api.hr-tech-platform.com', 'Production server')
    .build();
exports.swaggerOptions = {};
//# sourceMappingURL=swagger.config.js.map