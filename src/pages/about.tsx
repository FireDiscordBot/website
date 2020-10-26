import React from "react";

import Head from "../components/Head";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const About = () => (
  <>
    <Head title="About"/>
    <div id="content-section">
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>
            <div className="py-2 about-text">
              <strong>Fire</strong> is made by <strong>Geek#8405.</strong>
              <br/>
              <strong>Website</strong> is made by <strong>Nystrex#6606</strong>
              <br/>
              All rights reserved. &copy; 2020
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  </>
);

export default About;
