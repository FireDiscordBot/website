import { EventEmitter } from "events";

import * as React from "react";

import { EventHandler } from "../../lib/ws/event-handler";

const useWebsocket = (url: string, emitter: EventEmitter) => {
  const [handler, setHandler] = React.useState<EventHandler | null>(null);
  React.useEffect(() => {
    const ws = new WebSocket(url);
    const handler = new EventHandler(emitter).setWebsocket(ws);
    setHandler(handler);

    return () => ws.close();
  }, [emitter, url]);

  return [handler];
};

export default useWebsocket;
