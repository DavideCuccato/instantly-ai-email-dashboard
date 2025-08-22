import knexLib from "knex";

const knex = knexLib({
  client: "sqlite3",
  connection: {
    filename: "./dev.sqlite3",
  },
  useNullAsDefault: true,
});

class DB {
  static async addLead(data) {
    return knex("leads").insert(data);
  }

  static async getAllEmails() {
    return knex("emails").select("*").orderBy("created_at", "desc");
  }

  static async getEmailById(id) {
    return knex("emails").where({ id }).first();
  }

  static async createEmail(data) {
    const [id] = await knex("emails").insert(data);
    return knex("emails").where({ id }).first();
  }

  static async deleteEmail(id) {
    return knex("emails").where({ id }).delete();
  }
}

export default DB;
