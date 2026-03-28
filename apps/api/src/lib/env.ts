export function getRequiredEnv(name: string): string {
    const value = process.env[name]

    if (!value || value.trim().length === 0) {
        throw new Error(
            `[ConfigError] Missing required environment variable: ${name}. ` +
            `Create apps/api/.env from apps/api/.env.example and set a valid value.`
        )
    }

    return value
}
