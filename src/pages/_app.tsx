import React from "react";
import type { AppProps } from "next/app";

import Footer from "../components/Footer";
import AppNavbar from "../components/AppNavbar";

import "bootstrap/dist/css/bootstrap.css";
import "../style.css";

import { EventHandler } from "../../lib/ws/event-handler";
import { Emitter } from "../../lib/ws/event-emitter";
import useWebsocket from "../hooks/use-websocket";

export const emitter = new Emitter();

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [handler] = useWebsocket("wss://aether-ws-dev.gaminggeek.dev/website", emitter);
  if (handler) {
    initHandler(handler);
  }

  return (
    <>
      <AppNavbar />
      <Component {...pageProps} />
      <Footer />
    </>
  );
};

const initHandler = async (handler: EventHandler) => {
  const events = ["SUBSCRIBE"] // may be populated with more in the future
  for (const event of events) emitter.removeAllListeners(event)
  emitter.on("SUBSCRIBE", (route, extra) => {
    handler.handleSubscribe(route, extra)
  })
  if (!handler.identified) handler.identify()
  const devToolsCheck = /./
  devToolsCheck.toString = () => {
    // dev tools is open
    handler.devToolsWarning()
    return ""
  }
  console.log("%c", devToolsCheck)
}

export default MyApp;
