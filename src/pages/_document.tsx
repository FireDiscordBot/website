import Document, { Html, Head, Main, NextScript } from "next/document";
import React from "react";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link href="/favicon.ico" rel="icon" />
          <link
            href="https://use.fontawesome.com/releases/v5.7.1/css/all.css"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />

          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "22fdececdce24b6dbb76f5eb5da10417"}'
          ></script>
          <script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
          <script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.1.3/webcomponents-bundle.js"></script>
          <script src="https://unpkg.com/@statuspage/status-widget/dist/index.js"></script>

          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
