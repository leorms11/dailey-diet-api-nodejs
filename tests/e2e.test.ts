import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/app.js";
import { knex } from "../src/database/database.js";

describe("Daily Diet API", () => {
	let token: string;
	let userId: string;

	beforeEach(async () => {
		await knex("meals").delete();
		await knex("users").delete();
	});

	describe("Users", () => {
		it("should create a user", async () => {
			const response = await app.inject({
				method: "POST",
				url: "/api/users",
				payload: {
					name: "John Doe",
					email: "john@example.com",
					password: "password123"
				}
			});

			expect(response.statusCode).toBe(201);
			const body = JSON.parse(response.body);
			expect(body.name).toBe("John Doe");
			expect(body.email).toBe("john@example.com");
			expect(body.password).toBeUndefined();
			userId = body.id;
		});

		it("should not create a user with duplicate email", async () => {
			await app.inject({
				method: "POST",
				url: "/api/users",
				payload: {
					name: "John Doe",
					email: "john@example.com",
					password: "password123"
				}
			});

			const response = await app.inject({
				method: "POST",
				url: "/api/users",
				payload: {
					name: "Jane Doe",
					email: "john@example.com",
					password: "password456"
				}
			});

			expect(response.statusCode).toBe(400);
		});

		it("should authenticate a user and return token", async () => {
			await app.inject({
				method: "POST",
				url: "/api/users",
				payload: {
					name: "John Doe",
					email: "john@example.com",
					password: "password123"
				}
			});

			const response = await app.inject({
				method: "POST",
				url: "/api/login",
				payload: {
					email: "john@example.com",
					password: "password123"
				}
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.token).toBeDefined();
			expect(body.user.email).toBe("john@example.com");
			token = body.token;
			userId = body.user.id;
		});

		it("should not authenticate with invalid credentials", async () => {
			await app.inject({
				method: "POST",
				url: "/api/users",
				payload: {
					name: "John Doe",
					email: "john@example.com",
					password: "password123"
				}
			});

			const response = await app.inject({
				method: "POST",
				url: "/api/login",
				payload: {
					email: "john@example.com",
					password: "wrongpassword"
				}
			});

			expect(response.statusCode).toBe(401);
		});

		it("should update user profile", async () => {
			const createResponse = await app.inject({
				method: "POST",
				url: "/api/users",
				payload: {
					name: "John Doe",
					email: "john@example.com",
					password: "password123"
				}
			});

			const loginResponse = await app.inject({
				method: "POST",
				url: "/api/login",
				payload: {
					email: "john@example.com",
					password: "password123"
				}
			});

			token = JSON.parse(loginResponse.body).token;

			const updateResponse = await app.inject({
				method: "PUT",
				url: "/api/profile",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Jane Doe",
					email: "jane@example.com"
				}
			});

			expect(updateResponse.statusCode).toBe(200);
			const body = JSON.parse(updateResponse.body);
			expect(body.name).toBe("Jane Doe");
			expect(body.email).toBe("jane@example.com");
		});

		it("should reset user password", async () => {
			const createResponse = await app.inject({
				method: "POST",
				url: "/api/users",
				payload: {
					name: "John Doe",
					email: "john@example.com",
					password: "password123"
				}
			});

			const loginResponse = await app.inject({
				method: "POST",
				url: "/api/login",
				payload: {
					email: "john@example.com",
					password: "password123"
				}
			});

			token = JSON.parse(loginResponse.body).token;

			const resetResponse = await app.inject({
				method: "PUT",
				url: "/api/reset-password",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					password: "newpassword123"
				}
			});

			expect(resetResponse.statusCode).toBe(200);

			// Try login with old password - should fail
			const oldLoginResponse = await app.inject({
				method: "POST",
				url: "/api/login",
				payload: {
					email: "john@example.com",
					password: "password123"
				}
			});

			expect(oldLoginResponse.statusCode).toBe(401);

			// Try login with new password - should succeed
			const newLoginResponse = await app.inject({
				method: "POST",
				url: "/api/login",
				payload: {
					email: "john@example.com",
					password: "newpassword123"
				}
			});

			expect(newLoginResponse.statusCode).toBe(200);
		});
	});

	describe("Meals", () => {
		beforeEach(async () => {
			const createResponse = await app.inject({
				method: "POST",
				url: "/api/users",
				payload: {
					name: "John Doe",
					email: "john@example.com",
					password: "password123"
				}
			});

			const loginResponse = await app.inject({
				method: "POST",
				url: "/api/login",
				payload: {
					email: "john@example.com",
					password: "password123"
				}
			});

			token = JSON.parse(loginResponse.body).token;
			userId = JSON.parse(loginResponse.body).user.id;
		});

		it("should create a meal", async () => {
			const response = await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Lunch",
					description: "Rice and beans",
					date: "2026-03-04 12:00",
					isOnDiet: true
				}
			});

			expect(response.statusCode).toBe(201);
			const body = JSON.parse(response.body);
			expect(body.name).toBe("Lunch");
			expect(body.isOnDiet).toBe(true);
		});

		it("should list user meals", async () => {
			await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Breakfast",
					date: "2026-03-04 08:00",
					isOnDiet: true
				}
			});

			await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Lunch",
					date: "2026-03-04 12:00",
					isOnDiet: true
				}
			});

			const response = await app.inject({
				method: "GET",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				}
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.length).toBe(2);
		});

		it("should filter meals with search query across fields", async () => {
			// prepare a variety of meals
			await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: { authorization: `Bearer ${token}` },
				payload: { name: "Salad", description: "Fresh greens", date: "2026-03-05 12:00", isOnDiet: true }
			});

			await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: { authorization: `Bearer ${token}` },
				payload: { name: "Burger", description: "Fast food", date: "2026-03-06 13:00", isOnDiet: false }
			});

			// search by name
			let res = await app.inject({
				method: "GET",
				url: "/api/meals?search=Burger",
				headers: { authorization: `Bearer ${token}` }
			});
			expect(res.statusCode).toBe(200);
			expect(JSON.parse(res.body)).toHaveLength(1);

			// search by description
			res = await app.inject({
				method: "GET",
				url: "/api/meals?search=greens",
				headers: { authorization: `Bearer ${token}` }
			});
			expect(JSON.parse(res.body)).toHaveLength(1);

			// search by date substring
			res = await app.inject({
				method: "GET",
				url: "/api/meals?search=2026-03-05",
				headers: { authorization: `Bearer ${token}` }
			});
			expect(JSON.parse(res.body)).toHaveLength(1);

			// search by boolean value
			res = await app.inject({
				method: "GET",
				url: "/api/meals?search=false",
				headers: { authorization: `Bearer ${token}` }
			});
			expect(JSON.parse(res.body)).toHaveLength(1);
		});

		it("should get a specific meal", async () => {
			const createResponse = await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Lunch",
					date: "2026-03-04 12:00",
					isOnDiet: true
				}
			});

			const mealId = JSON.parse(createResponse.body).id;

			const response = await app.inject({
				method: "GET",
				url: `/api/meals/${mealId}`,
				headers: {
					authorization: `Bearer ${token}`
				}
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.name).toBe("Lunch");
		});

		it("should update a meal", async () => {
			const createResponse = await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Lunch",
					date: "2026-03-04 12:00",
					isOnDiet: true
				}
			});

			const mealId = JSON.parse(createResponse.body).id;

			const response = await app.inject({
				method: "PUT",
				url: `/api/meals/${mealId}`,
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Updated Lunch",
					isOnDiet: false
				}
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.name).toBe("Updated Lunch");
			expect(body.isOnDiet).toBe(false);
		});

		it("should delete a meal", async () => {
			const createResponse = await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Lunch",
					date: "2026-03-04 12:00",
					isOnDiet: true
				}
			});

			const mealId = JSON.parse(createResponse.body).id;

			const deleteResponse = await app.inject({
				method: "DELETE",
				url: `/api/meals/${mealId}`,
				headers: {
					authorization: `Bearer ${token}`
				}
			});

			expect(deleteResponse.statusCode).toBe(204);

			// Try to get deleted meal - should return 404
			const getResponse = await app.inject({
				method: "GET",
				url: `/api/meals/${mealId}`,
				headers: {
					authorization: `Bearer ${token}`
				}
			});

			expect(getResponse.statusCode).toBe(404);
		});

		it("should get user metrics", async () => {
			// Create some meals
			await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Breakfast",
					date: "2026-03-04 08:00",
					isOnDiet: true
				}
			});

			await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Lunch",
					date: "2026-03-04 12:00",
					isOnDiet: true
				}
			});

			await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Snack",
					date: "2026-03-04 15:00",
					isOnDiet: false
				}
			});

			const response = await app.inject({
				method: "GET",
				url: "/api/metrics",
				headers: {
					authorization: `Bearer ${token}`
				}
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.totalMeals).toBe(3);
			expect(body.totalOnDiet).toBe(2);
			expect(body.totalOffDiet).toBe(1);
		});

		it("should filter meals by name using search query", async () => {
			await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Breakfast",
					date: "2026-03-04 08:00",
					isOnDiet: true
				}
			});

			await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Lunch",
					date: "2026-03-04 12:00",
					isOnDiet: true
				}
			});

			const response = await app.inject({
				method: "GET",
				url: "/api/meals?search=Breakfast",
				headers: {
					authorization: `Bearer ${token}`
				}
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.length).toBe(1);
			expect(body[0].name).toBe("Breakfast");
		});

		it("should not access other user's meals", async () => {
			// Create a meal with first user
			const createResponse = await app.inject({
				method: "POST",
				url: "/api/meals",
				headers: {
					authorization: `Bearer ${token}`
				},
				payload: {
					name: "Lunch",
					date: "2026-03-04 12:00",
					isOnDiet: true
				}
			});

			const mealId = JSON.parse(createResponse.body).id;

			// Create another user
			const secondUserLogin = await app.inject({
				method: "POST",
				url: "/api/login",
				payload: {
					email: "jane@example.com",
					password: "password456"
				}
			});

			// If second user not found, create them first
			if (secondUserLogin.statusCode === 401) {
				await app.inject({
					method: "POST",
					url: "/api/users",
					payload: {
						name: "Jane Doe",
						email: "jane@example.com",
						password: "password456"
					}
				});

				const newLogin = await app.inject({
					method: "POST",
					url: "/api/login",
					payload: {
						email: "jane@example.com",
						password: "password456"
					}
				});

				const secondUserToken = JSON.parse(newLogin.body).token;

				// Try to access first user's meal with second user token
				const response = await app.inject({
					method: "GET",
					url: `/api/meals/${mealId}`,
					headers: {
						authorization: `Bearer ${secondUserToken}`
					}
				});

				expect(response.statusCode).toBe(404);
			}
		});
	});
});
