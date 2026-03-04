import type { FastifyInstance } from "fastify";
import * as mealsController from "../controllers/mealsController.js";
import { verifyUserLoggedIn } from "../middleware/verifyUserLoggedIn.js";

export async function mealsRoutes(app: FastifyInstance) {
	// All meal routes are protected
	app.post(
		"/api/meals",
		{ preHandler: [verifyUserLoggedIn] },
		mealsController.createMeal
	);

	app.get(
		"/api/meals",
		{ preHandler: [verifyUserLoggedIn] },
		mealsController.listMeals
	);

	app.get(
		"/api/meals/:id",
		{ preHandler: [verifyUserLoggedIn] },
		mealsController.getMeal
	);

	app.put(
		"/api/meals/:id",
		{ preHandler: [verifyUserLoggedIn] },
		mealsController.updateMeal
	);

	app.delete(
		"/api/meals/:id",
		{ preHandler: [verifyUserLoggedIn] },
		mealsController.deleteMeal
	);

	app.get(
		"/api/metrics",
		{ preHandler: [verifyUserLoggedIn] },
		mealsController.getUserMetrics
	);
}
