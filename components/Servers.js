import React from "react";

const Servers = ({ servers }) => {
    return (
        <div className={"row d-flex align-items-center justify-content-center"}>
            {servers.map((server, i) => (
                <div className={"server-card"} key={i} onClick={() => window.open(server.vanity, "_blank")}>
                    <div className={"server-header"}>
                        <img className={"server-splash"} src={`${server.splash}`} />
                        <img className={"server-icon"} src={`${server.icon}`} />
                    </div>
                    <div className={"server-body text-left"}>
                        <div className={"server-title"}>
                            {server.badge === null ? (
                                ""
                            ) : server.badge === "partner" ? (
                                <img
                                    height="20px"
                                    src={`https://cdn.discordapp.com/emojis/647415387843198988.png?v=1`}
                                    style={{ marginRight: 5 + "px" }}
                                    title="Partnered Server"
                                ></img>
                            ) : server.badge === "verified" ? (
                                <img
                                    height="20px"
                                    src={`https://cdn.discordapp.com/emojis/647415388577071104.png?v=1`}
                                    style={{ marginRight: 5 + "px" }}
                                    title="Verified Server"
                                ></img>
                            ) : server.badge === "fireverified" ? (
                                <img
                                    height="20px"
                                    src={`https://cdn.discordapp.com/emojis/671243744774848512.png?v=1`}
                                    style={{ marginRight: 5 + "px" }}
                                    title="Fire Verified Server"
                                ></img>
                            ) : server.badge === "premium" ? (
                                <img
                                    height="20px"
                                    src={`https://cdn.discordapp.com/emojis/680519037704208466.png?v=1`}
                                    style={{ marginRight: 5 + "px" }}
                                    title="Premium Server"
                                ></img>
                            ) : (
                                ""
                            )}
                            <div className={"server-name fire"}>
                                <span>{server.name}</span>
                            </div>
                        </div>
                        <div className={"server-description"} id={`${server.id}-desc`}>
                            <span>{server.description}</span>
                        </div>
                        <div className={"server-member-info"}>
                            <div className={"server-member-count"}>
                                <div className={"server-online-dot"}></div>
                                <div className={"server-online-text"} id={`${server.id}-online`}>
                                    <strong>{server.online}</strong>&nbsp;Online
                                </div>
                            </div>
                            <div className={"server-member-count"}>
                                <div className={"server-offline-dot"}></div>
                                <div id={`${server.id}-members`}>
                                    <strong>{server.members}</strong>&nbsp;Members
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Servers;
