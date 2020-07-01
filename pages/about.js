import React from "react";

import Head from "../components/Head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div>
      <Head title={"About"} />
      <Nav />
      <div id="content-section">
        <div className="container text-center">
          <div className={"row d-flex justify-content-center"}>
            <div className={"col-md-6"}>
              <div className={"text-center medium py-2 about-text"}>
                <strong>Fire</strong> is made by <strong>Geek#8405.</strong>
                <br />
                <strong>Website</strong> is made by{" "}
                <strong>Nystrex#6606</strong>
                <br />
                All rights reserved. © 2020
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
