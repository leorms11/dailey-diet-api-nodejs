import type { FastifyRequest, FastifyReply } from "fastify";

export async function verifyUserLoggedIn(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	try {
		await request.jwtVerify();
	} catch (err) {
		return reply.status(401).send({ error: "Unauthorized" });
	}
}
