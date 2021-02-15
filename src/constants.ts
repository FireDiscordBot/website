import { Plan } from "@/interfaces/fire"

export const fire = {
  defaultPrefix: "$",
  githubUrl: "https://github.com/FireDiscordBot/bot",
  aetherApiUrl: "https://aether.gaminggeek.dev",
  realtimeStatsUrl: "wss://aether-ws.gaminggeek.dev/realtime-stats",
  plans: <Plan[]>[
    {
      name: "Premium - 1 Server",
      priceId: "price_1HVPBgAIj8KliTBvqsHfGvaG",
    },
    {
      name: "Premium - 3 Servers",
      priceId: "price_1HVPBdAIj8KliTBvtdtg1OLn",
    },
    {
      name: "Premium - 5 Servers",
      priceId: "price_1HVPBYAIj8KliTBvsCU0k8ms",
    },
  ],
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
