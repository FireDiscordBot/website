export const openUrl = (url: string, newTab = false, download: boolean | string = false) => {
  const element = document.createElement("a")
  element.href = url

  if (newTab) {
    element.target = "_blank"
  }
  if (download || typeof download === "string") {
    element.download = typeof download === "string" ? download : ""
  }

  element.click()
  element.remove()
}
