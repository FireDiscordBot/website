import React, { useState } from "react";

import { NextPage } from "next";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Head from "../components/Head";
import ServersList from "../components/ServersList";
import Pagination from "../components/Pagination";
import type { Server } from "../types";

interface Props {
	servers: Server[];
}

const Discover: NextPage<Props> = (props) => {
	const [filter, setFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [serversPerPage] = useState(12);

	const filteredServers = props.servers.filter((guild) =>
		guild.name.trim().toLowerCase().includes(filter.trim().toLowerCase())
	);

	const indexOfLastServer = currentPage * serversPerPage;
	const indexOfFirstServer = indexOfLastServer - serversPerPage;
	const currentServers = filteredServers.slice(indexOfFirstServer, indexOfLastServer);

	const paginate = (pageNumber) => setCurrentPage(pageNumber);

	return (
		<>
			<Head title={"Discover"} />
			<div id="content-section">
				<Container className="text-left">
					<Row>
						<Col xs={12}>
							<h1>Public Servers</h1>
						</Col>
						<Col xs={12}>
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
						</Col>
					</Row>
					<Row className="mt-4">
						<Col xs={12}>
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
											Visit the community-run Coronavirus Discord to talk about COVID-19, and head
											to{" "}
											<a
												className="anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB"
												href="https://www.cdc.gov/coronavirus/2019-nCoV/index.html"
												rel="noreferrer noopener"
												target="_blank">
												CDC.gov
											</a>{" "}
											for more information.
										</div>
									</div>
								</div>
								<a
									type="button"
									className="button-2RuHlm button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN"
									href="https://inv.wtf/covid"
									target="_blank">
									<div className="contents-18-Yxp">Visit COVID-19 Discord</div>
								</a>
							</div>
						</Col>
					</Row>
					<Row className="mt-4">
						<ServersList servers={currentServers} />
					</Row>
					<Row className="align-items-center">
						<Col xs={12}>
							<Pagination
								rowsPerPage={serversPerPage}
								totalRowCount={filteredServers.length}
								paginate={paginate}
								currentPage={currentPage}
								className="justify-content-center"
							/>
						</Col>
					</Row>
				</Container>
			</div>
		</>
	);
};

Discover.getInitialProps = async () => {
	const fetchOptions: RequestInit = {
		mode: "cors",
		// Use custom user-agent only in server-side.
		headers: !process.browser ? { "User-Agent": "Fire Website" } : undefined,
	};
	const response = await fetch("https://api.gaminggeek.dev/discoverable", fetchOptions);
	const servers: Server[] = await response.json();

	return { servers };
};

export default Discover;
