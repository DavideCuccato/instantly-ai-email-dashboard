import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import DB from '../db';
import { CreateEmailSchema } from '../types/email';
import { z } from 'zod';

const ParamsSchema = z.object({
  id: z.string().transform(Number),
});

export default async function emailRoutes(fastify: FastifyInstance) {
  // Get all emails
  fastify.get('/emails', {
    schema: {
      tags: ['emails'],
      summary: 'Get all emails',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              to: { type: 'string' },
              cc: { type: 'string', nullable: true },
              bcc: { type: 'string', nullable: true },
              subject: { type: 'string' },
              body: { type: 'string' },
              created_at: { type: 'string' },
              updated_at: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const emails = await DB.getAllEmails();
      return emails;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch emails' });
      return;
    }
  });

  // Get single email by ID
  fastify.get('/emails/:id', {
    schema: {
      tags: ['emails'],
      summary: 'Get email by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            to: { type: 'string' },
            cc: { type: 'string', nullable: true },
            bcc: { type: 'string', nullable: true },
            subject: { type: 'string' },
            body: { type: 'string' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = ParamsSchema.parse(request.params);
      const email = await DB.getEmailById(id);

      if (!email) {
        return reply.code(404).send({ error: 'Email not found' });
      }

      return email;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch email' });
      return;
    }
  });

  // Create new email
  fastify.post('/emails', {
    schema: {
      tags: ['emails'],
      summary: 'Create new email',
      body: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          cc: { type: 'string', nullable: true },
          bcc: { type: 'string', nullable: true },
          subject: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['to', 'subject', 'body'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            to: { type: 'string' },
            cc: { type: 'string', nullable: true },
            bcc: { type: 'string', nullable: true },
            subject: { type: 'string' },
            body: { type: 'string' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = CreateEmailSchema.parse(request.body);

      const email = await DB.createEmail({
        ...validatedData,
        cc: validatedData.cc || null,
        bcc: validatedData.bcc || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      reply.code(201).send(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError;
        reply.code(400).send({ error: 'Invalid request data', details: zodError.issues });
      } else {
        reply.code(500).send({ error: 'Failed to create email' });
      }
    }
  });

  // Delete email
  fastify.delete('/emails/:id', {
    schema: {
      tags: ['emails'],
      summary: 'Delete email',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        204: {
          type: 'null',
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = ParamsSchema.parse(request.params);
      await DB.deleteEmail(id);
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: 'Failed to delete email' });
      return;
    }
  });
}