import DB from "../db/index.js";

export default async function emailRoutes(fastify, options) {
  // Get all emails
  fastify.get("/emails", async (request, reply) => {
    try {
      const emails = await DB.getAllEmails();
      return emails;
    } catch (error) {
      reply.code(500).send({ error: "Failed to fetch emails" });
    }
  });

  // Get single email by ID
  fastify.get("/emails/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const email = await DB.getEmailById(id);

      if (!email) {
        return reply.code(404).send({ error: "Email not found" });
      }

      return email;
    } catch (error) {
      reply.code(500).send({ error: "Failed to fetch email" });
    }
  });

  // Create new email
  fastify.post("/emails", async (request, reply) => {
    try {
      const { to, cc, bcc, subject, body } = request.body;

      const email = await DB.createEmail({
        to,
        cc: cc || null,
        bcc: bcc || null,
        subject,
        body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      reply.code(201).send(email);
    } catch (error) {
      reply.code(500).send({ error: "Failed to create email" });
    }
  });

  // Delete email
  fastify.delete("/emails/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      await DB.deleteEmail(id);
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: "Failed to delete email" });
    }
  });
}
