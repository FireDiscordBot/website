// From: https://dev.to/vvo/show-a-top-progress-bar-on-fetch-and-router-events-in-next-js-4df3

import Router from "next/router"
import NProgress from "nprogress"

let timer: NodeJS.Timeout
let state: "loading" | "stop" = "stop"
let activeRequests = 0
const delay = 250

NProgress.configure({ showSpinner: false })

function load() {
  if (state === "loading") return

  state = "loading"
  timer = setTimeout(() => NProgress.start(), delay)
}

function stop() {
  if (activeRequests > 0) return

  state = "stop"
  clearTimeout(timer)
  NProgress.done()
}

Router.events.on("routeChangeStart", load)
Router.events.on("routeChangeComplete", stop)
Router.events.on("routeChangeError", stop)

const originalFetch = window.fetch
window.fetch = async (...args) => {
  if (activeRequests === 0) load()

  activeRequests++

  try {
    return await originalFetch(...args)
  } catch (error) {
    return Promise.reject(error)
  } finally {
    activeRequests -= 1
    if (activeRequests === 0) stop()
  }
}
