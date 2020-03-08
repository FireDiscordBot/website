import React, { useState } from "react";
import fetch from "isomorphic-unfetch";

import Head from "../components/Head";
import Nav from "../components/Nav";
import Servers from "../components/Servers";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";

const Discover = props => {
    const [filter, setFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [serversPerPage] = useState(12);

    const filteredServers = props.servers.filter(guild =>
        guild.name
            .trim()
            .toLowerCase()
            .includes(filter.trim().toLowerCase())
    );

    const indexOfLastServer = currentPage * serversPerPage;
    const indexOfFirstServer = indexOfLastServer - serversPerPage;
    const currentServers = filteredServers.slice(indexOfFirstServer, indexOfLastServer);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <div>
            <Head title={"Discover"} />
            <Nav />
            <div id="content-section">
                <div className="container text-left">
                    <h1>Public Servers</h1>
                    <div className={"row row d-flex align-items-center justify-content-center"}>
                        <div className={"col-md"}>
                            <input
                                type="text"
                                id="filter"
                                className={"form-control"}
                                placeholder="Search for Guild..."
                                onChange={e => {
                                    setFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                    <br />
                    <Servers servers={currentServers} />
                    <br />
                    <Pagination
                        serversPerPage={serversPerPage}
                        totalServers={filteredServers.length}
                        paginate={paginate}
                        currentPage={currentPage}
                    />
                </div>
            </div>
            <Footer />
            <script async src="http://localhost:3000/main.js"></script>
        </div>
    );
};

Discover.getInitialProps = async function() {
    const res = await fetch("https://api.gaminggeek.dev/discoverable");

    const data = await res.json();
    return {
        servers: data
    };
};

export default Discover;
