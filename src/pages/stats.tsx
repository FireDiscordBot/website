import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Head from "../components/Head";
import type { Stats } from "../types";
import ClusterModal from "../components/ClusterModal";

interface Props {
  initialStats: Stats;
}

const StatsPage: NextPage<Props> = ({ initialStats }) => {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [clusterInfoId, setClusterInfoId] = useState<number | null>(null);

  const [filter, setFilter] = useState<string | null>(null);

  const onChangeFilterField = (e) => {
    if (/(\d{15,21})$/im.test(e.target.value)) setFilter(e.target.value);
    else setFilter(null);
  };

  const findShard = (guild: string, shardCount: number) => {
    // @ts-ignore
    return (guild >> 22) % shardCount;
  };

  useEffect(() => {
    const ws = new WebSocket("wss://aether-ws.gaminggeek.dev/realtime-stats");
    ws.onmessage = (msg) => {
      const newStats: Stats = JSON.parse(msg.data);
      setStats(newStats);
    };

    return () => ws.close();
  }, []);

  let clusterModal = undefined;

  if (typeof clusterInfoId === "number") {
    const closeModal = () => {
      setClusterInfoId(undefined);
    };
    const cluster = stats.clusters.find(
      (cluster) => cluster.id === clusterInfoId
    );

    clusterModal = <ClusterModal show onHide={closeModal} cluster={cluster} />;
  }

  return (
    <>
      <Head title="Stats" />
      <div id="content-section">
        <Container className="text-center">
          <Row className="justify-content-between">
            <Col md={4}>
              <div className="about-text">
                <h4>
                  <span className="fire">CPU:</span> {stats.cpu}
                </h4>
                <h4>
                  <span className="fire">RAM:</span> {stats.ram}
                </h4>
              </div>
            </Col>
            <Col md={4}>
              <div className="about-text">
                <h4>
                  <span className="fire">Clusters:</span> {stats.clusterCount}
                </h4>
                <h4>
                  <span className="fire">Shards:</span> {stats.shardCount}
                </h4>
              </div>
            </Col>
            <Col md={4}>
              <div className="about-text">
                <h4>
                  <span className="fire">Guilds:</span>{" "}
                  {stats.guilds.toLocaleString()}
                </h4>
                <h4>
                  <span className="fire">Users:</span>{" "}
                  {stats.users.toLocaleString()}
                </h4>
              </div>
            </Col>
          </Row>
          <div style={{ padding: 10, borderRadius: 10 }}>
              <input
                type="text"
                id="filter"
                className="form-control"
                style={{ padding: 10, borderRadius: 10 }}
                placeholder="Enter a Server ID to find it's cluster..."
                onChange={onChangeFilterField}
              />
          </div>
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
                        <div
                          className={
                            filter &&
                            cluster.shards.find(
                              (shard) =>
                                shard.id == findShard(filter, stats.shardCount)
                            )
                              ? "cluster-box-current"
                              : "cluster-box"
                          }
                        >
                          <span
                            className={
                              cluster.error
                                ? "cluster-text-offline"
                                : cluster.unavailableGuilds ||
                                  cluster.shards.find(
                                    (shard) => shard.status != 0
                                  )
                                ? "cluster-text-unavailable"
                                : "cluster-text"
                            }
                          >
                            {cluster.id}
                          </span>
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

StatsPage.getInitialProps = async () => {
  const fetchOptions: RequestInit = {
    mode: "cors",
    // Use custom user-agent only in server-side.
    headers: !process.browser ? { "User-Agent": "Fire Website" } : undefined,
  };
  const response = await fetch(
    "https://aether.gaminggeek.dev/stats",
    fetchOptions
  );
  const initialStats: Stats = await response.json();

  return {
    initialStats,
  };
};

export default StatsPage;
