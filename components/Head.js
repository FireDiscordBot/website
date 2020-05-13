import Heads from "next/head";

const Head = props => (
    <Heads>
        <title>{props.title}</title>
        <link rel="icon" href="/favicon.ico" />
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css"
        />
        <script
            src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"
            integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
            crossOrigin="anonymous"
        ></script>{" "}
        <script
            src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"
            integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6"
            crossOrigin="anonymous"
        ></script>
        <link
            rel="stylesheet"
            href="https://use.fontawesome.com/releases/v5.7.1/css/all.css"
        />
        <link rel="stylesheet" href="/style.css" />
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=UA-154645451-2`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-154645451-2', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        <script
            src="https://cdn.polyfill.io/v2/polyfill.min.js"
        ></script>
        <script
            src="https://unpkg.com/@webcomponents/webcomponentsjs@2.1.3/webcomponents-bundle.js"
        ></script>
        <script
            src="https://unpkg.com/@statuspage/status-widget/dist/index.js"
        ></script>
    </Heads>

);

export default Head;
