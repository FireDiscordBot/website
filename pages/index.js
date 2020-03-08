import React from "react";

import Head from "../components/Head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Home = () => {
    return (
        <div>
            <Head title={"Home"} />
            <Nav />

            <div id="content-section">
                <div className="container text-center">
                    <div className={"row d-flex justify-content-center"}>
                        <div className={"col-md-6"}>
                            <h1 className={"fire"}>Fire</h1>
                            <h3>
                                A Discord bot for all your needs. With memes, music, moderation & more, Fire is the only
                                bot you'll need.
                            </h3>
                        </div>
                    </div>
                    <br />
                    <div className={"row"}>
                        <div className={"col-md bot-info-box"}>
                            <p>
                                <span>Integrations</span>
                                <br />
                                Fire has a few integrations that allow you to retreive content from external platforms such
                                as Reddit, Hypixel and even the Google Assistant.
                            </p>
                        </div>
                        <div className={"col-md bot-info-box"}>
                            <p>
                                <span>Utilities</span>
                                <br />
                                Fire has many different utilities to help you get information quickly about many thing.
                                Some examples include auto-quotes when you send a message link or being able to fetch
                                simple user info
                            </p>
                        </div>
                        <div className={"col-md bot-info-box"}>
                            <p>
                                <span>Moderation</span>
                                <br />
                                We know how hard moderation can be, so we try make things easy. With commands to mute,
                                block (per-channel mute), kick and ban, moderation is a piece of cake!
                            </p>
                        </div>
                    </div>
                    <br />
                    <div className={"row d-flex justify-content-center align-items-center"}>
                        <div className={"col-md"}>
                            <iframe
                                src={"https://api.gaminggeek.dev/discovery/564052798044504084"}
                                style={{ height: "100%;", width: "257px;", minHeight: "308px !important;" }}
                                allowtransparency="true"
                                frameBorder={0}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
