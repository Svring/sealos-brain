import type { EdgeTypes } from "@xyflow/react";
import FloatingErrorEdge from "@/mvvm/flow/edges/views/error-edge";
import FloatingEdge from "@/mvvm/flow/edges/views/floating-edge";

const edgeTypes: EdgeTypes = {
	floating: FloatingEdge,
	Error: FloatingErrorEdge,
};

export default edgeTypes;
