import React from "react";
import Table from "react-bootstrap/Table";

import type { Command } from "../types";

interface CommandsTableProps {
	prefix: string;
	commands: Command[];
}

const CommandsTable = ({ prefix, commands }: CommandsTableProps) => (
	<Table responsive striped>
		<thead>
			<th>Name</th>
			<th>Description</th>
			<th>Usage</th>
			<th>Aliases</th>
		</thead>
		<tbody>
			{commands.map((command) => (
				<tr key={command.name}>
					<td className="fire">{command.name}</td>
					<td className="text-white">{command.description}</td>
					<td className="text-white-50">{command.usage.replace("{prefix}", prefix)}</td>
					<td className="text-white-50">{command.aliases}</td>
				</tr>
			))}
		</tbody>
	</Table>
);

export default CommandsTable;
