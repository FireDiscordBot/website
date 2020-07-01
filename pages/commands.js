import React, { useState } from "react";
import { useRouter } from "next/router";
import fetch from "isomorphic-unfetch";

import Head from "../components/Head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Commands = (props) => {
  const [currentCategory, changeCategory] = useState(0);
  const [isSearching, setIsSeaching] = useState(false);
  const router = useRouter();
  var prefix = "$";
  if (router.query.prefix) {
    if (router.query.prefix.length <= 10) {
      prefix = router.query.prefix;
    } else {
      prefix = "$";
    }
  } else {
    prefix = "$";
  }
  const [filter, setFilter] = useState("");

  const filteredCommands = props.commands.filter((cmd) =>
    cmd.name.trim().toLowerCase().includes(filter.trim().toLowerCase())
  );

  return (
    <div>
      <Head title={"Commands"} />
      <Nav />
      <div id="content-section">
        <div className="container text-left">
          <div
            className={
              "row row d-flex align-items-center justify-content-center"
            }
          >
            <div className={"col-md"}>
              <input
                type="text"
                id="filter"
                className={"form-control"}
                placeholder="Search for Command..."
                onChange={(e) => {
                  setFilter(e.target.value);
                  setIsSeaching(true);

                  if (e.target.value.trim() === "") {
                    setFilter(e.target.value);
                    setIsSeaching(false);
                  }
                }}
              />
            </div>
          </div>
          <br />
          {!isSearching ? (
            <div className="row">
              <div className="col-md-3">
                <h3>
                  <strong>Categories</strong>
                </h3>
                <p className={"category-note"}>
                  {props.categories[currentCategory].Note}
                </p>

                <div id="categories">
                  <ul id="categories-list" className="list-unstyled">
                    {props.categories.map((e) => (
                      <li
                        key={e.id}
                        className={
                          e.id === currentCategory
                            ? "c-active noselect"
                            : "noselect"
                        }
                        onClick={() => changeCategory(e.id)}
                        disabled={e.id === currentCategory}
                      >
                        {e.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <br />
              </div>

              <div className="col-md-9">
                <div className="row">
                  <h3>
                    <strong>Commands</strong>
                  </h3>

                  <table className="table">
                    <thead className="table-head">
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Usage</th>
                        <th>Aliases</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {Object.entries(
                        props.categories[currentCategory].commands
                      )
                        .map(([name, obj]) => [name, ...Object.values(obj)])
                        .map((commandFields) => (
                          <tr key={commandFields}>
                            <td key={commandFields[1]} className={"name"}>
                              {commandFields[1]}
                            </td>
                            <td key={commandFields[2]} className={"desc"}>
                              {commandFields[2]}
                            </td>
                            <td key={commandFields[3]} className={"usage"}>
                              {commandFields[3].replace("{prefix}", prefix)}
                            </td>
                            <td key={commandFields[4]} className={"aliases"}>
                              {commandFields[4]}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <br />
                {props.categories[currentCategory].flags ? (
                  <div className="row">
                    <h3>
                      <strong>Flags</strong>
                    </h3>
                    <div
                      className="table-responsive"
                      style={{ paddingBottom: "0px" }}
                    >
                      <table className="table table-striped">
                        <thead className="table-head">
                          <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Usage</th>
                          </tr>
                        </thead>
                        <tbody className="table-body">
                          {Object.entries(
                            props.categories[currentCategory].flags
                          )
                            .map(([name, obj]) => [name, ...Object.values(obj)])
                            .map((commandFields) => (
                              <tr key={commandFields}>
                                <td key={commandFields[1]} className={"name"}>
                                  {commandFields[1]}
                                </td>
                                <td key={commandFields[2]} className={"desc"}>
                                  {commandFields[2]}
                                </td>
                                <td key={commandFields[3]} className={"usage"}>
                                  {commandFields[3]}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          ) : (
            <div className="col-md-12">
              <div className="row">
                <h3>
                  <strong>Commands</strong>
                </h3>

                <table className="table">
                  <thead className="table-head">
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Usage</th>
                      <th>Aliases</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {Object.entries(filteredCommands)
                      .map(([name, obj]) => [name, ...Object.values(obj)])
                      .map((commandFields) => (
                        <tr key={commandFields}>
                          <td key={commandFields[1]} className={"name"}>
                            {commandFields[1]}
                          </td>
                          <td key={commandFields[2]} className={"desc"}>
                            {commandFields[2]}
                          </td>
                          <td key={commandFields[3]} className={"usage"}>
                            {commandFields[3].replace("{prefix}", prefix)}
                          </td>
                          <td key={commandFields[4]} className={"aliases"}>
                            {commandFields[4]}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <br />
        </div>
      </div>
      <Footer />
    </div>
  );
};

Commands.getInitialProps = async function () {
  const res = await fetch("https://api.gaminggeek.dev/commands");
  const res2 = await fetch("https://api.gaminggeek.dev/allcommands");
  const categories = await res.json();
  const commands = await res2.json();

  return {
    categories: categories,
    commands: commands,
  };
};

export default Commands;
