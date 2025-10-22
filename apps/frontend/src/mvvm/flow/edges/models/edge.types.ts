import type { EdgeTypes } from "@xyflow/react";
import ErrorEdge from "../views/error-edge";
import FloatingEdge from "../views/floating-edge";

const edgeTypes: EdgeTypes = {
	floating: FloatingEdge,
	Error: ErrorEdge,
};

export default edgeTypes;
