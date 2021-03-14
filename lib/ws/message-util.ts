import { deflateSync, inflateSync } from "zlib"
import { Payload } from "../interfaces/aether"
import { Message } from "./message"

export class MessageUtil {
  static encode(message: Message) {
    const deflated = deflateSync(JSON.stringify(message), { level: 5 })
    return deflated.toString("base64")
  }

  static decode(message: string) {
    const inflated = inflateSync(Buffer.from(message, "base64"), {
      level: 5,
    })?.toString()
    if (!inflated) return null
    else return JSON.parse(inflated) as Payload
  }
}