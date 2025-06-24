import DevboxNode from "./devbox/devbox-node";
import DBProviderNode from "./dbprovider/dbprovider-node";
import AppLaunchpadNode from "./applaunchpad/applaunchpad-node";
import NetworkNode from "./network/network-node";
import AIProxyNode from "./aiproxy/aiproxy-node";
import CronJobNode from "./cronjob/cronjob-node";
import ObjectStorageNode from "./objectstorage/objectstorage-node";
import EmptyStateNode from "./empty-state-node";

const nodeTypes = {
  devbox: DevboxNode,
  cluster: DBProviderNode, // cluster resources use dbprovider node
  deployment: AppLaunchpadNode, // deployment resources use applaunchpad node
  network: NetworkNode,
  aiproxy: AIProxyNode,
  cronjob: CronJobNode,
  objectstoragebucket: ObjectStorageNode,
  "empty-state": EmptyStateNode,
};

export default nodeTypes;
