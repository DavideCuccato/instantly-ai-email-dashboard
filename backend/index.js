// ESM
import Fastify from "fastify";
import cors from "@fastify/cors";
import routes from "./src/routes/index.js";
import emailRoutes from "./src/routes/emails.js";
/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true,
});

// Register CORS
fastify.register(cors, {
  origin: "http://localhost:3000",
  credentials: true,
});

fastify.register(routes);
fastify.register(emailRoutes);

fastify.listen({ port: process.env.PORT }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is running on ${address}`);
});
