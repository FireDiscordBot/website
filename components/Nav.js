import React from "react";
import Link from 'next/link';

const NavLink = ({ href, children }) => (
    <Link href={href} passHref>
        <a className="nav-link">
            {children}
        </a>
    </Link>
);

const Nav = () => (
    <nav className="navbar navbar-dark navbar-expand-md" id="navbar">
        <div className="container">
            <Link href="/">
                <a className="navbar-brand" style={{fontSize: '14pt'}}>
                    <img id="logo-img" src="/logo.svg"/>
                </a>
            </Link>
            <button data-toggle="collapse" className="navbar-toggler" data-target="#navcol-1">
                <span className="sr-only">Toggle navigation</span>
                <span className="navbar-toggler-icon"/>
            </button>
            <div className="collapse navbar-collapse" id="navcol-1">
                <ul className="nav navbar-nav ml-auto">
                    <li className="nav-item" role="presentation">
                        <NavLink href="/discover">
                            Public Servers
                        </NavLink>
                    </li>
                    <li className="nav-item" role="presentation">
                        <NavLink href="/commands">
                            Commands
                        </NavLink>
                    </li>
                    <li className="nav-item" role="presentation">
                        <NavLink href="/stats">
                            Stats
                        </NavLink>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" href="https://inv.wtf/fire">
                            Support
                        </a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" href="https://github.com/FireDiscordBot">
                            GitHub
                        </a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <NavLink href="/about">
                            About
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
);

export default Nav;
