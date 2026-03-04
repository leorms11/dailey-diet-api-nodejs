import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import * as usersService from "../services/usersService.js";
import { extractZodErrorMessages } from "../utils/zodError.js";

const createUserSchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	password: z.string().min(1)
});

const authenticateUserSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1)
});

const updateUserSchema = z.object({
	name: z.string().min(1).optional(),
	email: z.email().optional()
});

const resetPasswordSchema = z.object({
	password: z.string().min(1)
});

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
	try {
		const body = createUserSchema.parse(request.body);
		const user = await usersService.createUser(body);
		return reply.status(201).send(user);
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			return reply.status(400).send({ error: extractZodErrorMessages(error) });
		}
		if (error.message === "Email already registered") {
			return reply.status(400).send({ error: error.message });
		}
		return reply.status(500).send({ error: error.message });
	}
}

export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
	try {
		const body = authenticateUserSchema.parse(request.body);
		const user = await usersService.authenticateUser(body);
		const token = request.server.jwt.sign(
			{ id: user.id },
			{ expiresIn: "24h" }
		);
		return reply.send({ token, user });
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			return reply.status(400).send({ error: extractZodErrorMessages(error) });
		}
		return reply.status(401).send({ error: error.message });
	}
}

export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
	try {
		const body = updateUserSchema.parse(request.body);
		const userId = (request.user as any).id;
		
		const userInput = Object.fromEntries(
			Object.entries(body).filter(([_, value]) => value !== undefined)
		);
		
		const user = await usersService.updateUser(userId, userInput as any);
		return reply.send(user);
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			return reply.status(400).send({ error: extractZodErrorMessages(error) });
		}
		if (error.message === "Email already in use") {
			return reply.status(400).send({ error: error.message });
		}
		return reply.status(500).send({ error: error.message });
	}
}

export async function resetPassword(request: FastifyRequest, reply: FastifyReply) {
	try {
		const body = resetPasswordSchema.parse(request.body);
		const userId = (request.user as any).id;
		const user = await usersService.resetPassword(userId, body.password);
		return reply.send(user);
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			return reply.status(400).send({ error: extractZodErrorMessages(error) });
		}
		return reply.status(500).send({ error: error.message });
	}
}

export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = (request.user as any).id;
		const user = await usersService.getUserById(userId);
		return reply.send(user);
	} catch (error: any) {
		return reply.status(404).send({ error: error.message });
	}
}
