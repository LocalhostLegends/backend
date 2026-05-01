import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Hirely API')
  .setDescription('Hirely — HR Technology Platform for Modern Teams')
  .setVersion('1.0.1')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addServer('http://localhost:3175', 'Development server')
  .addServer('https://backend-pcz4.onrender.com', 'Production server')
  .build();

export const swaggerOptions = {};
