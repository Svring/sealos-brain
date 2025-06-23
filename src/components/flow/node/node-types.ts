import DevboxNode from "./devbox/devbox-node";
import DBProviderNode from "./dbprovider/dbprovider-node";
import NetworkNode from "./network/network-node";
import AIProxyNode from "./aiproxy/aiproxy-node";
import CronJobNode from "./cronjob/cronjob-node";
import ObjectStorageNode from "./objectstorage/objectstorage-node";

const nodeTypes = {
  devbox: DevboxNode,
  dbprovider: DBProviderNode,
  network: NetworkNode,
  aiproxy: AIProxyNode,
  cronjob: CronJobNode,
  objectstorage: ObjectStorageNode,
};

export default nodeTypes;
