import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import * as mealsService from "../services/mealsService.js";
import { extractZodErrorMessages } from "../utils/zodError.js";

const createMealSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	date: z.string().min(1),
	isOnDiet: z.boolean()
});

const updateMealSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	date: z.string().min(1).optional(),
	isOnDiet: z.boolean().optional()
});

const filterMealSchema = z.object({
	// single search parameter that will be matched against multiple fields
	search: z.string().optional()
});

export async function createMeal(request: FastifyRequest, reply: FastifyReply) {
	try {
		const body = createMealSchema.parse(request.body);
		const userId = (request.user as any).id;
		
		const mealInput = {
			name: body.name,
			date: body.date,
			isOnDiet: body.isOnDiet,
			...(body.description && { description: body.description })
		};
		
		const meal = await mealsService.createMeal(userId, mealInput);
		return reply.status(201).send(meal);
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			return reply.status(400).send({ error: extractZodErrorMessages(error) });
		}
		return reply.status(500).send({ error: error.message });
	}
}

export async function listMeals(request: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = (request.user as any).id;
		const query = request.query as any;

		if (query.search) {
			const meals = await mealsService.filterMeals(userId, query.search);
			return reply.send(meals);
		}

		const meals = await mealsService.getMealsByUserId(userId);
		return reply.send(meals);
	} catch (error: any) {
		return reply.status(500).send({ error: error.message });
	}
}

export async function getMeal(request: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = (request.user as any).id;
		const { id } = request.params as any;
		const meal = await mealsService.getMealById(id, userId);
		return reply.send(meal);
	} catch (error: any) {
		if (error.message === "Meal not found") {
			return reply.status(404).send({ error: error.message });
		}
		return reply.status(500).send({ error: error.message });
	}
}

export async function updateMeal(request: FastifyRequest, reply: FastifyReply) {
	try {
		const body = updateMealSchema.parse(request.body);
		const userId = (request.user as any).id;
		const { id } = request.params as any;
		
		const mealInput = Object.fromEntries(
			Object.entries(body).filter(([_, value]) => value !== undefined)
		);
		
		const meal = await mealsService.updateMeal(id, userId, mealInput as any);
		return reply.send(meal);
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			return reply.status(400).send({ error: extractZodErrorMessages(error) });
		}
		if (error.message === "Meal not found") {
			return reply.status(404).send({ error: error.message });
		}
		return reply.status(500).send({ error: error.message });
	}
}

export async function deleteMeal(request: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = (request.user as any).id;
		const { id } = request.params as any;
		await mealsService.deleteMeal(id, userId);
		return reply.status(204).send();
	} catch (error: any) {
		if (error.message === "Meal not found") {
			return reply.status(404).send({ error: error.message });
		}
		return reply.status(500).send({ error: error.message });
	}
}

export async function getUserMetrics(request: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = (request.user as any).id;
		const metrics = await mealsService.getUserMetrics(userId);
		return reply.send(metrics);
	} catch (error: any) {
		return reply.status(500).send({ error: error.message });
	}
}
