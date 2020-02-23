import React from "react";

const Pagination = ({ serversPerPage, totalServers, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalServers / serversPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className={"row d-flex align-items-center justify-content-center"}>
            <nav>
                <ul className={"pagination"}>
                    <li className={`page-item + ${currentPage === 1 ? "disabled" : ""}`}>
                        <a onClick={() => paginate(1)} className={"page-link"}>
                            <i className="fas fa-fast-backward"></i>
                        </a>
                    </li>
                    <li className={`page-item + ${currentPage === 1 ? "disabled" : ""}`}>
                        <a onClick={() => paginate(currentPage - 1)} className={"page-link"}>
                            <i className="fas fa-backward"></i>
                        </a>
                    </li>
                    {pageNumbers.slice(currentPage - 1, currentPage + 5).map(number => (
                        <li key={number} className={`page-item + ${currentPage === number ? "active" : ""}`}>
                            <a onClick={() => paginate(number)} className={"page-link"}>
                                {number}
                            </a>
                        </li>
                    ))}
                    <li className={`page-item + ${currentPage === pageNumbers.length ? "disabled" : ""}`}>
                        <a onClick={() => paginate(currentPage + 1)} className={"page-link"}>
                            <i className="fas fa-forward"></i>
                        </a>
                    </li>
                    <li className={`page-item + ${currentPage === pageNumbers.length ? "disabled" : ""}`}>
                        <a onClick={() => paginate(pageNumbers.length)} className={"page-link"}>
                            <i className="fas fa-fast-forward"></i>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Pagination;
