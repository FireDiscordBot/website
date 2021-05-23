import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Head from "../components/Head";
import { FireStats } from "../../lib/interfaces/aether";
import ClusterModal from "../components/ClusterModal";

// import { emitter } from "./_app";

interface Props {
  initialStats: FireStats;
}

const StatsPage: NextPage<Props> = ({ initialStats }) => {
  const [stats, setStats] = useState<FireStats>(initialStats);
  const [clusterInfoId, setClusterInfoId] = useState<number | null>(null);

  const [filter, setFilter] = useState<string | null>(null);

  const onChangeFilterField = (e) => {
    if (/(\d{15,21})$/im.test(e.target.value)) setFilter(e.target.value);
    else setFilter(null);
  };

  const findShard = (guild: string, shardCount: number) => {
    return parseInt(
      ((BigInt(guild) >> BigInt(22)) % BigInt(shardCount)).toString()
    );
  };

  // React.useEffect(() => {
  //   emitter.removeAllListeners("REALTIME_STATS")
  //   emitter.on("REALTIME_STATS", setStats)
  // }, [])

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
                  <span className="fire">CPU:</span> {stats.cpu}%
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
              placeholder="Enter a Server ID to find its cluster..."
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
  ).catch(() => {
    return {
      json: () => {
        return {
          cpu: 0,
          ram: "0 B",
          totalRam: "0 B",
          clusterCount: 0,
          shardCount: 0,
          guilds: 0,
          users: 0,
          clusters: [],
        };
      },
    };
  });
  const initialStats: FireStats = await response.json();

  return {
    initialStats,
  };
};

export default StatsPage;
