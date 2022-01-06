import type { DefaultSeoProps } from "next-seo"

export const fire = {
  defaultPrefix: "$",
  requiredPermissions: "1007021303",
  requiredScopes: "bot applications.commands",
  githubUrl: "https://github.com/FireDiscordBot/bot",
  aetherApiUrl: process.env.NEXT_PUBLIC_AETHER_API_URL ?? "Not provided",
  refreshAfter: 259200000,
}

export const discord = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? "0",
  clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "Not provided",
  inviteUrl(guildId?: string) {
    return (
      `https://discord.com/oauth2/authorize?client_id=${this.clientId}` +
      `&permissions=${fire.requiredPermissions}` +
      `&scope=${encodeURIComponent(fire.requiredScopes)}` +
      (guildId ? `&guild_id=${guildId}` : "")
    )
  },
}

export const stripe = {
  publicKey: process.env.NEXT_PUBLIC_STRIPE_API_PUBLIC_KEY,
  secretKey: process.env.STRIPE_API_SECRET_KEY,
}

export const defaultSeoConfig: DefaultSeoProps = {
  titleTemplate: "%s | Fire",
  defaultTitle: "Fire",
  description:
    "A Discord bot for all your needs. With memes, utilities, moderation and more. Fire is the only bot you will need.",
  twitter: {
    site: "@FireDiscordBot",
    cardType: "",
  },
  openGraph: {
    type: "website",
    url: "https://fire.gaminggeek.dev/",
    title: "Fire",
    description:
      "A Discord bot for all your needs. With memes, utilities, moderation and more. Fire is the only bot you will need.",
  },
}

export const messageLinkRegex =
  /(https?:\/\/)?(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(?<guild_id>\d{15,21})\/(?<channel_id>\d{15,21})\/(?<message_id>\d{15,21})/g
