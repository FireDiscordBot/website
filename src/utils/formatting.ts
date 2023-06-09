import { AuthUser } from "@/interfaces/auth"
import { APIUser, APIUserPartial, PartialOAuthUser } from "@/interfaces/discord"
import { User } from "next-auth"

export const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

export const formatNumber = (
  number: number,
  options: Intl.NumberFormatOptions = {
    minimumFractionDigits: number % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  },
  locale?: string | string[],
) => number.toLocaleString(locale, options)

export const formatDateTime = (date: Date, options: Intl.DateTimeFormatOptions = {}, locale?: string | string[]) =>
  date.toLocaleString(locale, options)

// From: https://stackoverflow.com/a/18650828/9402849
export const formatBytes = (bytes: number, options?: Intl.NumberFormatOptions, locale?: string | string[]) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${formatNumber(bytes / Math.pow(k, i), options, locale)} ${sizes[i]}`
}

export const formatPomeloUsername = (user?: AuthUser | User | APIUserPartial | APIUser | PartialOAuthUser) => {
  if (!user) return "unknown.user"
  const username = "username" in user ? user.username : user.name
  return user.discriminator == "0" ? username : `${username}#${user.discriminator}`
}
