import { ClusterStats } from "../../lib/interfaces/aether";
import Modal from "react-bootstrap/Modal";
import React from "react";

interface Props {
  show: boolean;
  onHide: () => void;
  cluster: ClusterStats;
}

const getCommitURL = (version: string) =>
  `https://github.com/FireDiscordBot/bot/commit/${version}`;

const OnlineCluster = (cluster: ClusterStats) => {
  return (
    <Modal.Body>
      <div>
        <span className="fire">Uptime: </span>
        {cluster.uptime}
      </div>
      <div>
        <span className="fire">CPU: </span>
        {cluster.cpu}%
      </div>
      <div>
        <span className="fire">RAM: </span>
        {cluster.ram}
      </div>
      <div>
        <span className="fire">Version: </span>
        {cluster.version != "dev" ? (
          <a
            style={{
              color: "white",
            }}
            href={getCommitURL(cluster.version)}
            target="_blank"
          >
            {cluster.version}
          </a>
        ) : (
          cluster.version
        )}
      </div>
      <div>
        <span className="fire">Guilds: </span>
        {cluster.guilds?.toLocaleString()}
      </div>
      <div>
        <span className="fire">Unavailable Guilds: </span>
        {cluster.unavailableGuilds?.toLocaleString()}
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
  );
};

const OfflineCluster = (cluster: ClusterStats) => {
  return (
    <Modal.Body>
      <div>
        <span className="fire">Error: </span>
        {cluster.error}
      </div>
      <div>
        <span className="fire">Reason: </span>
        {cluster.reason}
      </div>
      <div>
        <span className="fire">Code: </span>
        {cluster.code}
      </div>
    </Modal.Body>
  );
};

const ClusterModal = ({ show, onHide, cluster }: Props) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header>
      <Modal.Title className="w-100 text-center" as="h3">
        {cluster.name ? (
          <span className="fire">{cluster.name}</span>
        ) : (
          <span className="fire">Cluster {cluster.id}</span>
        )}
      </Modal.Title>
    </Modal.Header>
    {cluster.error ? OfflineCluster(cluster) : OnlineCluster(cluster)}
  </Modal>
);

export default ClusterModal;
