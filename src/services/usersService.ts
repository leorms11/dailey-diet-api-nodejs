import * as usersRepository from "../repositories/usersRepository.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

export interface UserCredentials {
	email: string;
	password: string;
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

export async function createUser(input: CreateUserInput) {
	// Check if user already exists
	const existingUser = await usersRepository.getUserByEmail(input.email);
	if (existingUser) {
		throw new Error("Email already registered");
	}

	// Hash password
	const hashedPassword = await hashPassword(input.password);

	// Create user
	const user = await usersRepository.createUser({
		name: input.name,
		email: input.email,
		password: hashedPassword
	});

	// Return user without password
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	};
}

export async function authenticateUser(credentials: UserCredentials) {
	const user = await usersRepository.getUserByEmail(credentials.email);

	if (!user) {
		throw new Error("Email e/ou Senha inválidos");
	}

	const passwordMatch = await verifyPassword(credentials.password, user.password);

	if (!passwordMatch) {
		throw new Error("Email e/ou Senha inválidos");
	}

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	};
}

export async function getUserById(id: string) {
	const user = await usersRepository.getUserById(id);

	if (!user) {
		throw new Error("User not found");
	}

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	};
}

export async function updateUser(id: string, input: UpdateUserInput) {
	// Check if email is already in use by another user
	if (input.email) {
		const existingUser = await usersRepository.getUserByEmail(input.email);
		if (existingUser && existingUser.id !== id) {
			throw new Error("Email already in use");
		}
	}

	const user = await usersRepository.updateUser(id, input);

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	};
}

export async function resetPassword(id: string, newPassword: string) {
	if (!newPassword) {
		throw new Error("Password is required");
	}

	const hashedPassword = await hashPassword(newPassword);
	const user = await usersRepository.updateUserPassword(id, hashedPassword);

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	};
}
