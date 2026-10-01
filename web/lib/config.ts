function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const config = {
  databaseUrl: requiredEnv('DATABASE_URL'),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6380',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '',
  aiGatewayUrl: process.env.AI_GATEWAY_URL ?? 'http://localhost:20128/v1',
  aiGatewayKey: process.env.AI_GATEWAY_KEY ?? '',
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? '',
} as const;
