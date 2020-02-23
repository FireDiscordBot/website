import React from "react";

const Pagination = ({ serversPerPage, totalServers, paginate }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalServers / serversPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className={"row d-flex align-items-center justify-content-center"}>
            <nav>
                <ul className={"pagination"}>
                    {pageNumbers.map(number => (
                        <li key={number} className={"page-item"}>
                            <a onClick={() => paginate(number)} className={"page-link"}>
                                {number}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Pagination;
