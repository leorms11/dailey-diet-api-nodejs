import * as mealsRepository from "../repositories/mealsRepository.js";

export interface CreateMealInput {
	name: string;
	description?: string;
	date: string;
	isOnDiet: boolean;
}

export interface UpdateMealInput {
	name?: string;
	description?: string;
	date?: string;
	isOnDiet?: boolean;
}

export async function createMeal(userId: string, input: CreateMealInput) {
	const meal = await mealsRepository.createMeal({
		...input,
		userId
	});

	return meal;
}

export async function getMealById(mealId: string, userId: string) {
	const meal = await mealsRepository.getMealById(mealId, userId);

	if (!meal) {
		throw new Error("Meal not found");
	}

	return meal;
}

export async function getMealsByUserId(userId: string) {
	return mealsRepository.getMealsByUserId(userId);
}

export async function updateMeal(mealId: string, userId: string, input: UpdateMealInput) {
	// Verify meal exists and belongs to user
	const meal = await mealsRepository.getMealById(mealId, userId);
	if (!meal) {
		throw new Error("Meal not found");
	}

	return mealsRepository.updateMeal(mealId, userId, input);
}

export async function deleteMeal(mealId: string, userId: string) {
	const deleted = await mealsRepository.deleteMeal(mealId, userId);

	if (!deleted) {
		throw new Error("Meal not found");
	}

	return { success: true };
}

export async function filterMeals(
	userId: string,
	field: "name" | "description" | "date" | "isOnDiet",
	value: any
) {
	return mealsRepository.filterMealsByUserAndField(userId, field, value);
}

export async function getUserMetrics(userId: string) {
	const meals = await mealsRepository.getMealsByUserId(userId);

	const totalMeals = meals.length;
	const totalOnDiet = meals.filter((meal) => Boolean(meal.isOnDiet)).length;
	const totalOffDiet = meals.filter((meal) => !Boolean(meal.isOnDiet)).length;

	// Calculate best on-diet streak
	let bestOnDietStreak = 0;
	let currentStreak = 0;

	for (const meal of meals.reverse()) {
		if (Boolean(meal.isOnDiet)) {
			currentStreak++;
			bestOnDietStreak = Math.max(bestOnDietStreak, currentStreak);
		} else {
			currentStreak = 0;
		}
	}

	return {
		totalMeals,
		totalOnDiet,
		totalOffDiet,
		bestOnDietStreak
	};
}
