import React from "react";
import Modal from "react-bootstrap/Modal";
import type { Cluster } from "../types";

interface Props {
	show: boolean;
	onHide: () => void;
	cluster: Cluster;
}

const ClusterModal = ({ show, onHide, cluster }: Props) => (
	<Modal show={show} onHide={onHide}>
		<Modal.Header>
			<Modal.Title className="w-100 text-center" as="h3">
				Cluster <span className="fire">{cluster.id}</span>
			</Modal.Title>
		</Modal.Header>
		<Modal.Body>
			<div>
				<span className="fire">Uptime: </span>
				{cluster.uptime}
			</div>
			<div>
				<span className="fire">CPU: </span>
				{cluster.cpu}
			</div>
			<div>
				<span className="fire">RAM: </span>
				{cluster.ram}
			</div>
			<div>
				<span className="fire">PID: </span>
				{cluster.pid}
			</div>
			<div>
				<span className="fire">Guilds: </span>
				{cluster.guilds?.toLocaleString()}
			</div>
			<div>
				<span className="fire">Users: </span>
				{cluster.users?.toLocaleString()}
			</div>
			<div>
				<span className="fire">Commands: </span>
				{cluster.commands}
			</div>
		</Modal.Body>
	</Modal>
);

export default ClusterModal;
