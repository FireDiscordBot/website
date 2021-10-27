import React from "react";

const Footer = () => (
  <footer>
    <div>
      <div>
        © 2021 <span className="fire">Fire Bot</span>.
      </div>
      <div>
        Website Made by{" "}
        <a href="https://nystrex.com">
          <span className="fire">Hadi Ka (Nystrex)</span>
        </a>{" "}
        and{" "}
        <a href="https://bruno.codes">
          <span className="fire">Brunoh Paiva (Bruno)</span>
        </a>
        .
      </div>
    </div>
    <script src="https://fhrcp0477jwt.statuspage.io/embed/script.js"></script>
    {/* @ts-ignore */}
    <statuspage-widget
      title="Status"
      appearance="badge"
      src="https://firestatus.link"
    />
  </footer>
);

export default Footer;
