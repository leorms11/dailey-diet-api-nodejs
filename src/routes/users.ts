import type { FastifyInstance } from "fastify";
import * as usersController from "../controllers/usersController.js";
import { verifyUserLoggedIn } from "../middleware/verifyUserLoggedIn.js";

export async function usersRoutes(app: FastifyInstance) {
	app.post("/api/users", usersController.createUser);
	app.post("/api/login", usersController.authenticateUser);

	// Protected routes
	app.put("/api/profile", { preHandler: [verifyUserLoggedIn] }, usersController.updateUser);
	app.put("/api/reset-password", { preHandler: [verifyUserLoggedIn] }, usersController.resetPassword);
	app.get("/api/profile", { preHandler: [verifyUserLoggedIn] }, usersController.getProfile);
}
