import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Head from "../components/Head";

const Home = () => (
  <>
    <Head title="Home" />
    <div id="content-section">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <h1 className="fire">Fire</h1>
            <h3>
              A Discord bot for all your needs. With memes, utilities,
              moderation & more, Fire is the only bot you'll need.
            </h3>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col xs={12} className="d-flex justify-content-center">
            <a className="btn btn-fire" href="https://inv.wtf/bot">
              Invite Now
            </a>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col md className="bot-info-box">
            <p>
              <h4>Integrations</h4>
              Fire has a few integrations that allow you to retrieve content
              from external platforms such as Reddit and even the Google
              Assistant.
            </p>
          </Col>
          <Col md className="bot-info-box">
            <p>
              <h4>Utilities</h4>
              Fire has many different utilities to help you get information
              quickly about many things. Some examples include auto-quotes when
              you send a message link or being able to fetch simple user info
            </p>
          </Col>
          <Col md className="bot-info-box">
            <p>
              <h4>Moderation</h4>
              We know how hard moderation can be, so we try to make things easy.
              With commands to mute, block (per-channel mute), kick and ban,
              moderation is a piece of cake!
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  </>
);

export default Home;
