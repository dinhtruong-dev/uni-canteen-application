
export function safeISOString(value: any): string | null {
    if (value === null || value === undefined || value === '') return null;

    const date = new Date(value);

    // Kiểm tra Invalid Date
    if (isNaN(date.getTime())) return null;

    return date.toISOString();
}

export function safeISOStringWithFallback(value: any): string {
    return safeISOString(value) ?? new Date().toISOString();
}