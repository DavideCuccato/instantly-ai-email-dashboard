import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import routes from './routes';
import emailRoutes from './routes/emails';
import { env } from './config/env';

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
});

fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Email API',
      description: 'Email management API',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'emails', description: 'Email operations' },
    ],
  },
});

fastify.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  staticCSP: true,
});

fastify.register(routes);
fastify.register(emailRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${env.PORT}`);
    console.log(`Swagger documentation at http://localhost:${env.PORT}/documentation`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();