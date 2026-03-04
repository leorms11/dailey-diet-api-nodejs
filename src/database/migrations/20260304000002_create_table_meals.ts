import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("meals", (table) => {
		table.uuid("id").primary();
		table.string("name").notNullable();
		table.string("description").nullable();
		table.string("date").notNullable();
		table.boolean("isOnDiet").notNullable();
		table.string("createdAt").notNullable();
		table.string("updatedAt").notNullable();
		table.uuid("userId").notNullable();
		
		table.foreign("userId").references("id").inTable("users").onDelete("CASCADE");
		table.index("userId");
		table.index("date");
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("meals");
}
