import knexLib, { Knex } from 'knex';
import { env } from '../config/env';
import { Email, CreateEmailDto } from '../types/email';

const knex: Knex = knexLib({
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
});

class DB {
  static async getAllEmails(): Promise<Email[]> {
    return knex('emails').select('*').orderBy('created_at', 'desc');
  }

  static async getEmailById(id: number): Promise<Email | undefined> {
    return knex('emails').where({ id }).first();
  }

  static async createEmail(data: CreateEmailDto & { created_at: string; updated_at: string }): Promise<Email> {
    const [id] = await knex('emails').insert(data);
    const email = await knex('emails').where({ id }).first();
    return email!;
  }

  static async deleteEmail(id: number): Promise<number> {
    return knex('emails').where({ id }).delete();
  }
}

export default DB;