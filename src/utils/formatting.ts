export const formatNumber = (
  number: number,
  options: Intl.NumberFormatOptions = {
    minimumFractionDigits: number % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  },
  locale?: string | string[],
) => number.toLocaleString(locale, options)

// From: https://stackoverflow.com/a/18650828/9402849
export const formatBytes = (bytes: number, options?: Intl.NumberFormatOptions, locale?: string | string[]) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${formatNumber(bytes / Math.pow(k, i), options, locale)} ${sizes[i]}`
}
