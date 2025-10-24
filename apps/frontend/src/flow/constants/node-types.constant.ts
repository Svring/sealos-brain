import type { NodeTypes } from "@xyflow/react";
import { ClusterNodeBlock } from "@/blocks/flow/nodes/cluster-node.block";
import { DevboxNodeBlock } from "@/blocks/flow/nodes/devbox-node.block";
import { LaunchpadNodeBlock } from "@/blocks/flow/nodes/launchpad-node.block";
import { OsbNodeBlock } from "@/blocks/flow/nodes/osb-node.block";
import { DevGroupNode } from "../vms/group/dev-group-node.vm";
import { NetworkNode } from "../vms/network/network-node.vm";

const nodeTypes: NodeTypes = {
	devbox: DevboxNodeBlock,
	cluster: ClusterNodeBlock,
	launchpad: LaunchpadNodeBlock,
	objectstoragebucket: OsbNodeBlock,
	network: NetworkNode,
	devgroup: DevGroupNode,
};

export default nodeTypes;
