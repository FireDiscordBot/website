import React from "react";
import type { AppProps } from "next/app";

import Footer from "../components/Footer";
import AppNavbar from "../components/AppNavbar";

import "bootstrap/dist/css/bootstrap.css";
import "../style.css";

const MyApp = ({ Component, pageProps }: AppProps) => (
	<>
		<AppNavbar />
		<Component {...pageProps} />
		<Footer />
	</>
);

export default MyApp;
