import fetcher from "./fetcher"

import { fire } from "@/constants"
import { EventHandler } from "@/lib/ws/event-handler"

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}
const methods = ["get", "post", "delete", "patch", "put"]
const reflectors = [
  "toString",
  "valueOf",
  "inspect",
  "constructor",
  Symbol.toPrimitive,
  Symbol.for("nodejs.util.inspect.custom"),
]

interface RequestOptions {
  headers?: Record<string, unknown>
  version?: 1 | 2
  data?: BodyInit
}

// below is a hot mess but it allows cool things
type RequestMethod = "get" | "post" | "delete" | "patch" | "put"
type Handler = <T>(options?: RequestOptions) => Promise<T>
type Execute = Record<RequestMethod, Handler> & Record<string, Executor>
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Executor extends Execute {}

const routeBuilder = (eventHandler: EventHandler) => {
  const route = [""]
  const handler = {
    get(_: typeof noop, name: string): unknown {
      if (reflectors.includes(name)) return () => route.join("/")
      if (methods.includes(name)) {
        return <T>(options?: RequestOptions) =>
          fetcher<T>(`${fire.aetherApiUrl}${options?.version ? `/v${options.version}` : "/v2"}${route.join("/")}`, {
            method: name.toUpperCase() ?? "GET",
            body: options?.data ?? null,
            headers: {
              ...(options?.headers ?? {}),
              Authorization: `Bearer ${eventHandler.auth?.accessToken}`,
            },
          })
      }
      if (/v\d/g.test(name)) return new Proxy(noop, handler)
      route.push(name)
      return new Proxy(noop, handler)
    },
    apply(_: typeof noop, __: unknown, args: string[]): Execute {
      route.push(...args.filter((x) => x != null && !/v\d/g.test(x)))
      return (new Proxy(noop, handler) as unknown) as Execute
    },
  }
  return (new Proxy(noop, handler) as unknown) as Execute
}

export default routeBuilder
