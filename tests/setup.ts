import { beforeAll, afterAll, beforeEach } from "vitest";
import { knex } from "../src/database/database.js";
import env from "../src/env/index.js";

beforeAll(async () => {
	if (env.NODE_ENV === "test") {
		await knex.migrate.latest();
	}
});

afterAll(async () => {
	if (env.NODE_ENV === "test") {
		await knex.migrate.rollback();
		await knex.destroy();
	}
});

beforeEach(async () => {
	if (env.NODE_ENV === "test") {
		await knex("meals").delete();
		await knex("users").delete();
	}
});
