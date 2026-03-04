import fastify from "fastify";
import jwtPlugin from "@fastify/jwt";
import env from "./env/index.js";
import { usersRoutes } from "./routes/users.js";
import { mealsRoutes } from "./routes/meals.js";

export const app = fastify();

app.register(jwtPlugin, {
	secret: env.JWT_SECRET
});

app.register(usersRoutes);
app.register(mealsRoutes);