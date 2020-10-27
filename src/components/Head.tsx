import React from 'react';
import NextHead from "next/head";

interface Props {
	title: string;
}

const Head = ({title}: Props) => (
	<NextHead>
		<title>{title}</title>
	</NextHead>
);

export default Head;
