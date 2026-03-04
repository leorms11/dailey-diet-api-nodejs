import { z } from "zod";

export function extractZodErrorMessages(error: z.ZodError): string {
	const messages = error.issues.map((issue) => issue.message).join("; ");
	return messages;
}
