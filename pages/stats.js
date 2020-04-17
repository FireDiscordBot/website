import React from "react";
import fetch from "isomorphic-unfetch";

import Head from "../components/Head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";


const Stats = props => {
    return (
        <div>
            <Head title={"Stats"} />
            <Nav />

            <div id="content-section">
                <div className="container text-center">
                    <div className={"row d-flex justify-content-center "}>
                        <div className={"col-md-6 about-text"}>
                            <h3>
                                <strong>Bot Statistics</strong>
                            </h3>{" "}
                            <h4>
                                <span className={"stats-prefix"}>Uptime:</span>{" "}
                                {props.stats.uptime}
                            </h4>
                            <h4>
                                <span className={"stats-prefix"}>CPU:</span>{" "}
                                {props.stats.cpu}
                            </h4>
                            <h4>
                                <span className={"stats-prefix"}>RAM:</span>{" "}
                                {props.stats.ram}
                            </h4>
                            <h4>
                                <span className={"stats-prefix"}>Version:</span>{" "}
                                {props.stats.version}
                            </h4>
                            <h4>
                                <span className={"stats-prefix"}>Guilds:</span>{" "}
                                {formatNumber(props.stats.guilds)}
                            </h4>
                            <h4>
                                <span className={"stats-prefix"}>Users:</span>{" "}
                                {formatNumber(props.stats.users)}
                            </h4>
                            <h4>
                                <span className={"stats-prefix"}>
                                    Commands:
                                </span>{" "}
                                {props.stats.commands}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

Stats.getInitialProps = async function() {
    const res = await fetch("https://api.gaminggeek.dev/stats");
    const data = await res.json();
    return {
        stats: data
    };
};

function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Stats;
