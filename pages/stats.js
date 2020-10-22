import React, { useState } from "react";
import fetch from "isomorphic-unfetch";

import Head from "../components/Head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Stats = (props) => {
	const [clusterInfo, enableClusterInfo] = useState(false);
	const [clusterInfoId, setClusterInfoId] = useState(0);
	const cluster = props.stats.clusters.find((x) => x.id === clusterInfoId);

	const closeModal = () => {
		enableClusterInfo(false);
	};
	return (
		<div>
			<Head title={"Stats"} />
			<Nav />
			<div id="content-section">
				<div className="container text-center">
					<div className="row justify-content-between">
						<div className="col-md-3 about-text">
							<h4>
								<span className={"stats-prefix"}>CPU:</span> {props.stats.cpu}
							</h4>
							<h4>
								<span className={"stats-prefix"}>RAM:</span> {props.stats.ram}
							</h4>
						</div>
						<div className="col-md-3 about-text">
							<h4>
								<span className={"stats-prefix"}>Clusters:</span> {props.stats.clusterCount}
							</h4>
							<h4>
								<span className={"stats-prefix"}>Shards:</span> {props.stats.shardCount}
							</h4>
						</div>
						<div className="col-md-3 about-text">
							<h4>
								<span className={"stats-prefix"}>Guilds:</span> {props.stats.guilds}
							</h4>
							<h4>
								<span className={"stats-prefix"}>Users:</span> {props.stats.users}
							</h4>
						</div>
					</div>
					<br />
					<div className="row about-text justify-content-center">
						{props.stats.clusters.map((c) => (
							<div
								key={c.id}
								className="cluster-box"
								onClick={() => {
									setClusterInfoId(c.id);
									enableClusterInfo(true);
								}}>
								<span className="fire">{c.id}</span>
							</div>
						))}
					</div>
				</div>
				{clusterInfo && (
					<div className="modal" onClick={closeModal}>
						<div className="modal-content" onClick={(e) => e.stopPropagation()}>
							<span className="close" onClick={closeModal}>
								&times;
							</span>
							<div className="modal-title">
								<h2>
									Cluster <span className="fire">{cluster.id}</span>
								</h2>
							</div>
							<div className="modal-body">
								<span>
									<span className="fire">Uptime: </span>
									{cluster.uptime}
								</span>
								<br />
								<span>
									<span className="fire">CPU: </span>
									{cluster.cpu}
								</span>
								<br />
								<span>
									<span className="fire">RAM: </span>
									{cluster.ram}
								</span>
								<br />
								<span>
									<span className="fire">PID: </span>
									{cluster.pid}
								</span>
								<br />
								<span>
									<span className="fire">Guilds: </span>
									{cluster.guilds}
								</span>
								<br />
								<span>
									<span className="fire">Users: </span>
									{cluster.users}
								</span>
								<br />
								<span>
									<span className="fire">Commands: </span>
									{cluster.commands}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
			<Footer />
		</div>
	);
};

Stats.getInitialProps = async function () {
	const res = await fetch("https://aether.gaminggeek.dev/stats", {
		headers: { "User-Agent": "Fire Website" },
	});
	const data = await res.json();
	console.log(data);
	return {
		stats: data,
	};
};

function formatNumber(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Stats;
