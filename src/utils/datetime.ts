export function getCurrentDateTime(): string {
	return new Date().toISOString();
}

export function formatDatetime(date: Date | string): string {
	if (typeof date === "string") {
		return date;
	}
	return date.toISOString();
}
