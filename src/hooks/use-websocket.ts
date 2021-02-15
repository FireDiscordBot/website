import * as React from "react"

const useWebsocket = (url: string) => {
  const [lastMessage, setLastMessage] = React.useState<MessageEvent | null>(null)

  React.useEffect(() => {
    const ws = new WebSocket(url)
    ws.onmessage = (message) => setLastMessage(message)

    return () => ws.close()
  }, [url])

  return [lastMessage]
}

export default useWebsocket
