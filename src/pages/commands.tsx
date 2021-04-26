import React, { useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import type { Category, Command } from "../types";
import Head from "../components/Head";
import CommandsTable from "../components/CommandsTable";
import CategoryFlagsTable from "../components/CategoryFlagsTable";

interface Props {
  categories: Category[];
  commands: Command[];
}

const Commands: NextPage<Props> = ({ categories, commands }) => {
  const router = useRouter();

  const prefix =
    router.query.prefix && router.query.prefix.length <= 10
      ? (router.query.prefix as string)
      : "$";

  const [currentCategoryId, changeCategory] = useState(0);
  const [filter, setFilter] = useState<string | null>(null);
  const isSearching = typeof filter === "string";

  const onChangeFilterField = (e) => {
    setFilter(e.target.value.trim() === "" ? null : e.target.value);
  };

  let view: JSX.Element;

  if (!isSearching) {
    const categoriesComponents = categories.map((category) => {
      const handleClick = () => changeCategory(category.id);
      return (
        <li
          key={category.id}
          className={
            category.id === currentCategoryId
              ? "c-active no-select"
              : "no-select"
          }
          onClick={handleClick}
        >
          {category.name}
        </li>
      );
    });

    const currentCategory = categories[currentCategoryId];

    const flagsView = currentCategory.flags && (
      <>
        <h3>
          <strong>Flags</strong>
        </h3>
        <div className="table-responsive" style={{ paddingBottom: "0px" }}>
          <CategoryFlagsTable prefix={prefix} flags={currentCategory.flags} />
        </div>
      </>
    );

    view = (
      <>
        <Col md={3}>
          <div className="sticky">
            <h3>
              <strong>Categories</strong>
            </h3>
            <p className="category-note">{currentCategory.Note}</p>

            <div id="categories">
              <ul id="categories-list" className="list-unstyled">
                {categoriesComponents}
              </ul>
            </div>
          </div>
        </Col>

        <Col md={9}>
          <h3>
            <strong>Commands</strong>
          </h3>

          <CommandsTable prefix={prefix} commands={currentCategory.commands} />
          {flagsView}
        </Col>
      </>
    );
  } else {
    const filteredCommands = commands.filter((cmd) =>
      cmd.name.trim().toLowerCase().includes(filter.trim().toLowerCase())
    );

    view = (
      <Col md={12}>
        <h3>
          <strong>Commands</strong>
        </h3>
        <CommandsTable prefix={prefix} commands={filteredCommands} />
      </Col>
    );
  }

  return (
    <>
      <Head title="Commands" />
      <div id="content-section">
        <Container>
          <Row>
            <Col xs={12}>
              <input
                type="text"
                id="filter"
                className="form-control"
                placeholder="Search for Command..."
                onChange={onChangeFilterField}
              />
            </Col>
          </Row>
          <Row className="mt-4">{view}</Row>
        </Container>
      </div>
    </>
  );
};

Commands.getInitialProps = async () => {
  const fetchOptions: RequestInit = {
    mode: "cors",
    // Use custom user-agent only in server-side.
    headers: !process.browser ? { "User-Agent": "Fire Website" } : undefined,
  };
  let categories: Category[] = [
      {
        id: 0,
        name: "Error",
        commands: [
          {
            name: "Error",
            description: "Failed to fetch commands",
            usage: "",
            aliases: "",
          },
        ],
      },
    ],
    commands: Command[] = [];
  try {
    const promises = await Promise.all([
      fetch("https://aether.gaminggeek.dev/commands", fetchOptions),
      fetch("https://aether.gaminggeek.dev/allcommands", fetchOptions),
    ]);

    const [cats, cmds] = (await Promise.all(
      promises.map((response) => response.json())
    )) as [Category[], Command[]];
    (categories = cats), (commands = cmds);
  } catch {}

  return {
    categories,
    commands,
  };
};

export default Commands;
