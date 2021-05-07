import React from "react";
import NextLink from "next/link";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { useRouter } from "next/router";
import Nav from "react-bootstrap/Nav";

import { emitter } from "../pages/_app";

interface NavLinkProps {
  href: string;
}

const NavLink = ({ href, children }: React.PropsWithChildren<NavLinkProps>) => {
  const isExternal = href.startsWith("http");
  const navLinks = (
    <Nav.Link className="text-white px-3" href={href}>
      {children}
    </Nav.Link>
  );

  return !isExternal ? (
    <NextLink href={href} passHref>
      {navLinks}
    </NextLink>
  ) : (
    navLinks
  );
};

const AppNavbar = () => {
  const router = useRouter();
  emitter.emit("SUBSCRIBE", router.route);

  return (
    <Navbar bg="dark" expand="md">
      <Container>
        <NextLink href="/" passHref>
          <Navbar.Brand>
            <img id="logo-img" src="/logo_white.svg" />
          </Navbar.Brand>
        </NextLink>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <NavLink href="/discover">Public Servers</NavLink>
            <NavLink href="/commands">Commands</NavLink>
            <NavLink href="/stats">Stats</NavLink>
            <NavLink href="https://inv.wtf/fire">Support</NavLink>
            <NavLink href="https://github.com/FireDiscordBot">GitHub</NavLink>
            <NavLink href="/about">About</NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
