import { knex } from "../database/database.js";
import { generateUUID } from "../utils/uuid.js";
import { getCurrentDateTime } from "../utils/datetime.js";

export interface Meal {
	id: string;
	name: string;
	description?: string;
	date: string;
	isOnDiet: boolean;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateMealInput {
	name: string;
	description?: string;
	date: string;
	isOnDiet: boolean;
	userId: string;
}

export interface UpdateMealInput {
	name?: string;
	description?: string;
	date?: string;
	isOnDiet?: boolean;
}

function normalizeMeal(meal: any): Meal {
	if (!meal) return meal;
	return {
		...meal,
		isOnDiet: Boolean(meal.isOnDiet)
	};
}

export async function createMeal(input: CreateMealInput): Promise<Meal> {
	const id = generateUUID();
	const now = getCurrentDateTime();

	const meal: Meal = {
		id,
		name: input.name,
		...(input.description && { description: input.description }),
		date: input.date,
		isOnDiet: input.isOnDiet,
		userId: input.userId,
		createdAt: now,
		updatedAt: now
	};

	await knex("meals").insert(meal);
	return meal;
}

export async function getMealById(id: string, userId?: string): Promise<Meal | undefined> {
	let query = knex("meals").where({ id });

	if (userId) {
		query = query.where({ userId });
	}

	const meal = await query.first();
	return meal ? normalizeMeal(meal) : undefined;
}

export async function getMealsByUserId(userId: string): Promise<Meal[]> {
	const meals = await knex("meals").where({ userId }).orderBy("date", "desc");
	return meals.map(normalizeMeal);
}

export async function deleteMeal(id: string, userId: string): Promise<boolean> {
	const deleted = await knex("meals").where({ id, userId }).delete();
	return deleted > 0;
}

export async function updateMeal(
	id: string,
	userId: string,
	input: UpdateMealInput
): Promise<Meal> {
	const now = getCurrentDateTime();
	const updateData: any = { updatedAt: now };

	if (input.name !== undefined) {
		updateData.name = input.name;
	}
	if (input.description !== undefined) {
		updateData.description = input.description;
	}
	if (input.date !== undefined) {
		updateData.date = input.date;
	}
	if (input.isOnDiet !== undefined) {
		updateData.isOnDiet = input.isOnDiet;
	}

	await knex("meals").where({ id, userId }).update(updateData);

	const meal = await getMealById(id, userId);
	if (!meal) {
		throw new Error("Meal not found");
	}

	return meal;
}

export async function filterMealsByUserAndField(
	userId: string,
	field: "name" | "description" | "date" | "isOnDiet",
	value: any
): Promise<Meal[]> {
	let query = knex("meals").where("userId", userId);

	if (field === "name" || field === "description") {
		query = query.where(field, "like", `%${value}%`);
	} else if (field === "date") {
		query = query.where(field, value);
	} else if (field === "isOnDiet") {
		query = query.where(field, value);
	}

	const meals = await query.orderBy("date", "desc");
	return meals.map(normalizeMeal);
}

// new helper that performs a broad search across several fields based on a single string
export async function filterMealsBySearch(userId: string, search: string): Promise<Meal[]> {
	let query = knex("meals").where("userId", userId).andWhere(function () {
		this.where("name", "like", `%${search}%`)
			.orWhere("description", "like", `%${search}%`)
			.orWhere("date", "like", `%${search}%`);

		const lowered = search.toLowerCase();
		if (lowered === "true" || lowered === "false") {
			this.orWhere("isOnDiet", lowered === "true");
		}
	});

	const meals = await query.orderBy("date", "desc");
	return meals.map(normalizeMeal);
}
