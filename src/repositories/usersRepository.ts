import { knex } from "../database/database.js";
import { generateUUID } from "../utils/uuid.js";
import { getCurrentDateTime } from "../utils/datetime.js";

export interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	date?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateUserInput {
	name: string;
	email: string;
	password: string;
}

export interface UpdateUserInput {
	name?: string;
	email?: string;
}

export async function createUser(input: CreateUserInput): Promise<User> {
	const id = generateUUID();
	const now = getCurrentDateTime();

	const user: User = {
		id,
		name: input.name,
		email: input.email,
		password: input.password,
		createdAt: now,
		updatedAt: now
	};

	await knex("users").insert(user);
	return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
	return knex("users").where({ email }).first();
}

export async function getUserById(id: string): Promise<User | undefined> {
	return knex("users").where({ id }).first();
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
	const now = getCurrentDateTime();
	const updateData: any = { updatedAt: now };

	if (input.name !== undefined) {
		updateData.name = input.name;
	}
	if (input.email !== undefined) {
		updateData.email = input.email;
	}

	await knex("users").where({ id }).update(updateData);

	const user = await getUserById(id);
	if (!user) {
		throw new Error("User not found");
	}

	return user;
}

export async function updateUserPassword(id: string, password: string): Promise<User> {
	const now = getCurrentDateTime();

	await knex("users").where({ id }).update({
		password,
		updatedAt: now
	});

	const user = await getUserById(id);
	if (!user) {
		throw new Error("User not found");
	}

	return user;
}
