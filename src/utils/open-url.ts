export const openUrl = (url: string, newTab = false, isDownload = false) => {
  const element = document.createElement("a")
  element.href = url
  if (newTab) element.target = "_blank"
  if (isDownload) element.download = ""
  element.click()
}
