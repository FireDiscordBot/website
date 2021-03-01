import { deflateSync, inflateSync } from "zlib"

import { Message } from "./message"

export class MessageUtil {
  static encode(message: Message) {
    const deflated = deflateSync(JSON.stringify(message), { level: 5 })
    return deflated.toString("base64")
  }

  static decode(message: string) {
    let inflated: string
    try {
      inflated = inflateSync(Buffer.from(message, "base64"), {
        level: 5,
      }).toString()
    } catch {
      return null
    }
    const parsed = JSON.parse(inflated)
    if (typeof parsed.t !== "number") {
      return null
    }
    return new Message(parsed.t, parsed.d)
  }
}
