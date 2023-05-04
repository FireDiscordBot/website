import { DefaultSeoProps } from "next-seo"

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
  prices: {
    premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
    addon_monthly: process.env.STRIPE_PRICE_ADDON_MONTHLY,
    addon_yearly: process.env.STRIPE_PRICE_ADDON_YEARLY,
  },
}

export const PAGE_URL = process.env.NEXTAUTH_URL ?? "https://getfire.bot"

export const defaultSeoConfig: DefaultSeoProps = {
  titleTemplate: "%s | Fire",
  defaultTitle: "Fire",
  description:
    "A Discord bot for all your needs. With memes, utilities, moderation and more. Fire is the only bot you will need.",
  twitter: {
    handle: "@gaminggeekdev", // twitter:creator
    site: "@FireDiscordBot",
    cardType: "summary",
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "Fire",
    images: [
      {
        url: `${PAGE_URL}/img/avatar`,
        width: 1024,
        height: 1024,
        alt: "A white Fire logo with a red background, the logo used as the bot's profile picture.",
      },
    ],
    description:
      "A Discord bot for all your needs. With memes, utilities, moderation and more. Fire is the only bot you will need.",
  },
}

export const messageLinkRegex =
  /(https?:\/\/)?(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(?<guild_id>\d{15,21}|@me)\/(?<channel_id>\d{15,21})\/(?<message_id>\d{15,21})/g
