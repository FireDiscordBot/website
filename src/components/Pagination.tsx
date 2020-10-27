import React from "react";
import BootstrapPagination from "react-bootstrap/Pagination";

interface Props {
	paginate: (page: number) => void;
	rowsPerPage: number;
	totalRowCount: number;
	currentPage: number;
	className?: string;
}

const Pagination = ({ paginate, rowsPerPage, totalRowCount, currentPage, className }: Props) => {
	const pages: number[] = [];

	for (let i = 1; i <= Math.ceil(totalRowCount / rowsPerPage); i++) {
		pages.push(i);
	}

	const goToFirst = () => paginate(1);
	const goToPrevious = () => paginate(currentPage - 1);
	const goToNext = () => paginate(currentPage + 1);
	const goToLast = () => paginate(pages.length);

	return (
		<BootstrapPagination className={className}>
			<BootstrapPagination.First disabled={currentPage === 1} onClick={goToFirst} />
			<BootstrapPagination.Prev disabled={currentPage === 1} onClick={goToPrevious} />
			{pages.slice(currentPage - 1, currentPage + 5).map((number) => {
				const clickHandler = () => paginate(number);
				return (
					<BootstrapPagination.Item key={number} active={currentPage === number} onClick={clickHandler}>
						{number}
					</BootstrapPagination.Item>
				);
			})}
			<BootstrapPagination.Next disabled={currentPage === pages.length} onClick={goToNext} />
			<BootstrapPagination.Last disabled={currentPage === pages.length} onClick={goToLast} />
		</BootstrapPagination>
	);
};

export default Pagination;
