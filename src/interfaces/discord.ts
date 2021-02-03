/**
 * https://discord.com/developers/docs/resources/user#user-object-user-structure
 */
export type DiscordApiUser = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  mfa_enabled: boolean;
  locale: string;
  verified: boolean;
  email: string;
  flags: number;
  premium_type: number;
  public_flags: number;
}

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  features: string[];
  permissions_new: string;
}