import React from "react";
import Table from 'react-bootstrap/Table';

import type {CategoryFlag} from "../types";

interface FlagsTableProps {
  prefix: string;
  flags: CategoryFlag[];
}

const CategoryFlagsTable = ({prefix, flags}: FlagsTableProps) => (
  <Table responsive>
    <thead>
    <th>Name</th>
    <th>Description</th>
    <th>Usage</th>
    </thead>
    <tbody>
    {flags.map((flag) => (
      <tr key={flag.name}>
        <td className="fire">
          {flag.name}
        </td>
        <td className="text-white">
          {flag.description}
        </td>
        <td className="text-white-50">
          {flag.usage.replace("{prefix}", prefix)}
        </td>
      </tr>
    ))}
    </tbody>
  </Table>
);

export default CategoryFlagsTable;