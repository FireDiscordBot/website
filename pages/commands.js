import React, {useState} from "react";
import {useRouter} from "next/router";
import fetch from "isomorphic-unfetch";

import Head from "../components/Head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Commands = props => {
    const [currentCategory, changeCategory] = useState(0);
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

    return (
        <div>
            <Head title={"Commands"} />

            <Nav />

            <div id="content-section">
                <div className="container text-left">
                    <div className="row">
                        <div className="col-md-3">
                            <h3>
                                <strong>Categories</strong>
                            </h3>
                            <p className={"category-note"}>
                                {props.categories[currentCategory].Note}
                            </p>

                            <div id="categories">
                                <ul
                                    id="categories-list"
                                    className="list-unstyled"
                                >
                                    {props.categories.map(e => (
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
                                            props.categories[currentCategory]
                                                .commands
                                        )
                                            .map(([name, obj]) => [
                                                name,
                                                ...Object.values(obj)
                                            ])
                                            .map(commandFields => (
                                                <tr key={commandFields[0]}>
                                                    <td
                                                        key={commandFields[0]}
                                                        className={"name"}
                                                    >
                                                        {commandFields[0]}
                                                    </td>
                                                    <td
                                                        key={commandFields[1]}
                                                        className={"desc"}
                                                    >
                                                        {commandFields[1]}
                                                    </td>
                                                    <td
                                                        key={commandFields[2]}
                                                        className={"usage"}
                                                    >
                                                        {commandFields[2].replace(
                                                            "{prefix}",
                                                            prefix
                                                        )}
                                                    </td>
                                                    <td
                                                        key={commandFields[3]}
                                                        className={"aliases"}
                                                    >
                                                        {commandFields[3]}
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
                                                    props.categories[
                                                        currentCategory
                                                    ].flags
                                                )
                                                    .map(([name, obj]) => [
                                                        name,
                                                        ...Object.values(obj)
                                                    ])
                                                    .map(commandFields => (
                                                        <tr
                                                            key={
                                                                commandFields[0]
                                                            }
                                                        >
                                                            {commandFields.map(
                                                                field => (
                                                                    <td
                                                                        key={
                                                                            field
                                                                        }
                                                                        className={
                                                                            commandFields[0] ===
                                                                            field
                                                                                ? "name"
                                                                                : commandFields[1] ===
                                                                                  field
                                                                                ? "desc"
                                                                                : commandFields[2] ===
                                                                                  field
                                                                                ? "usage"
                                                                                : ""
                                                                        }
                                                                    >
                                                                        {field}
                                                                    </td>
                                                                )
                                                            )}
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
                </div>
            </div>
            <Footer/>
        </div>
    );
};

Commands.getInitialProps = async function() {
    const res = await fetch("https://api.gaminggeek.dev/commands");
    const data = await res.json();
    return {
        categories: data
    };
};

export default Commands;
