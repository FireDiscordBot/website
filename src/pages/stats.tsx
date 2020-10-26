import React, {useState} from "react";
import type {NextPage} from "next";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Head from "../components/Head";
import type {Stats as StatsType} from "../types";
import ClusterModal from "../components/ClusterModal";

interface Props {
  stats: StatsType
}

const Stats: NextPage<Props> = ({stats}) => {
  const [clusterInfoId, setClusterInfoId] = useState<number | null>(null);

  let clusterModal = undefined;

  if (typeof clusterInfoId === 'number') {
    const closeModal = () => {
      setClusterInfoId(undefined);
    };
    const cluster = stats.clusters.find((cluster) => cluster.id === clusterInfoId);

    clusterModal = (
      <ClusterModal show onHide={closeModal} cluster={cluster}/>
    );
  }

  return (
    <>
      <Head title="Stats"/>
      <div id="content-section">
        <Container className="text-center">
          <Row className="justify-content-between">
            <Col md={3}>
              <div className="about-text">
                <h4>
                  <span className="fire">CPU:</span> {stats.cpu}
                </h4>
                <h4>
                  <span className="fire">RAM:</span> {stats.ram}
                </h4>
              </div>
            </Col>
            <Col md={3}>
              <div className="about-text">
                <h4>
                  <span className="fire">Clusters:</span> {stats.clusterCount}
                </h4>
                <h4>
                  <span className="fire">Shards:</span> {stats.shardCount}
                </h4>
              </div>
            </Col>
            <Col md={3}>
              <div className="about-text">
                <h4>
                  <span className="fire">Guilds:</span> {stats.guilds.toLocaleString()}
                </h4>
                <h4>
                  <span className="fire">Users:</span> {stats.users.toLocaleString()}
                </h4>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div className="about-text">
                <Row className="justify-content-center">
                  {stats.clusters.map((cluster) => {
                    const openModal = () => setClusterInfoId(cluster.id);
                    return (
                      <Col
                        key={cluster.id}
                        onClick={openModal}
                        xs={3}
                        sm={2}
                        lg={1}
                      >
                        <div className="cluster-box">
                          <span className="fire">{cluster.id}</span>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
        {clusterModal}
      </div>
    </>
  );
};

Stats.getInitialProps = async () => {
  const fetchOptions: RequestInit = {
    mode: 'cors',
    // Use custom user-agent only in server-side.
    headers: !process.browser ? {"User-Agent": "Fire Website"} : undefined
  }
  const response = await fetch("https://aether.gaminggeek.dev/stats", fetchOptions);
  const stats: StatsType = await response.json();

  return {
    stats,
  };
};

export default Stats;
