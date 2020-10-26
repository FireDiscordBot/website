import React from "react";
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Media from 'react-bootstrap/Media';
import type {Server} from "../types";

interface ServerDisplayProps {
  server: Server;
}

const ServerDisplay = ({server}: ServerDisplayProps) => (
  <Card className="bg-dark text-white server-card">
    <Card.Img src={server.splash} alt="Server splash"/>
    <Card.ImgOverlay className="d-flex flex-column justify-content-end">
      <Media>
        <img className="server-icon" src={server.icon}/>
        <Media.Body className="text-truncate">
          {server.name}
          <div className="server-member-count">
            <div className="server-members-text" id={`${server.id}-members`}>
              {server.members}&nbsp;Members
            </div>
          </div>
        </Media.Body>
      </Media>
      <a className="stretched-link" href={server.vanity}/>
    </Card.ImgOverlay>
  </Card>
);

interface ServersListProps {
  servers: Server[]
}

const ServersList = ({servers}: ServersListProps) => {
  return (
    <>
      {servers.map((server) => (
        <Col xs={6} md={4} className="mb-4">
          <ServerDisplay server={server}/>
        </Col>
      ))}
    </>
  );
};

export default ServersList;
