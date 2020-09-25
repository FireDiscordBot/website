import React, { useState } from "react";
import fetch from "isomorphic-unfetch";

import Head from "../components/Head";
import Nav from "../components/Nav";
import Servers from "../components/Servers";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";

const Discover = (props) => {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [serversPerPage] = useState(12);

  const filteredServers = props.servers.filter((guild) =>
    guild.name.trim().toLowerCase().includes(filter.trim().toLowerCase())
  );

  const indexOfLastServer = currentPage * serversPerPage;
  const indexOfFirstServer = indexOfLastServer - serversPerPage;
  const currentServers = filteredServers.slice(
    indexOfFirstServer,
    indexOfLastServer
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <Head title={"Discover"} />
      <Nav />
      <div id="content-section">
        <div className="container text-left">
          <h1>Public Servers</h1>
          <div
            className={
              "row row d-flex align-items-center justify-content-center"
            }
          >
            <div className={"col-md"}>
              <input
                type="text"
                id="filter"
                className={"form-control"}
                placeholder="Search for Guild..."
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <br />
          <div className="container-RHl2Ju">
            <div className="content-2CqL_a">
              <div
                className="icon-3o6xvg avatar-JMNKnp iconSizeMedium-2OqPjI iconInactive-98JN5i"
                role="button"
                style={{
                  backgroundImage:
                    "url(https://cdn.discordapp.com/icons/670375966232674336/6b8c377dd199b30bd37b93923762c34f.png?size=256)",
                }}
              />
              <div className="text-2IH2ZS">
                <h3 className="wrapper-1sSZUt base-1x0h_U size16-1P40sf">
                  Stay safe and informed
                </h3>
                <div className="colorHeaderSecondary-3Sp3Ft size14-e6ZScH">
                  Visit the community-run Coronavirus Discord to talk about
                  COVID-19, and head to{" "}
                  <a
                    className="anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB"
                    href="https://www.cdc.gov/coronavirus/2019-nCoV/index.html"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    CDC.gov
                  </a>{" "}
                  for more information.
                </div>
              </div>
            </div>
            <button
              type="button"
              className="button-2RuHlm button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN"
              onClick={() => window.open("https://inv.wtf/covid", "_blank")}
            >
              <div className="contents-18-Yxp">Visit COVID-19 Discord</div>
            </button>
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
    </div>
  );
};

Discover.getInitialProps = async function () {
  const res = await fetch("https://api.gaminggeek.dev/discoverable", {
    headers: { "User-Agent": "Fire Website" },
  });

  const data = await res.json();
  return {
    servers: data,
  };
};

export default Discover;
