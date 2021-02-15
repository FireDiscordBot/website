export const fire = {
  defaultPrefix: "$",
  githubUrl: "https://github.com/FireDiscordBot/bot",
  aetherApiUrl: process.env.NEXT_PUBLIC_AETHER_API_URL ?? "Not provided",
  realtimeStatsUrl: process.env.NEXT_PUBLIC_AETHER_WS_API_URL ?? "Not provided",
}

export const discord = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? "0",
  clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "Not provided",
  get inviteUrl() {
    return `https://discord.com/oauth2/authorize?client_id=${this.clientId}&permissions=1007021303&scope=bot%20applications.commands`
  },
}

export const stripe = {
  publicKey: process.env.NEXT_PUBLIC_STRIPE_API_PUBLIC_KEY ?? "Not provided",
  secretKey: process.env.STRIPE_API_SECRET_KEY ?? "Not provided",
}
