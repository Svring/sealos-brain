import DevboxNode from "./devbox/devbox-node";
import DBProviderNode from "./dbprovider/dbprovider-node";
import NetworkNode from "./network/network-node";

const nodeTypes = {
  devbox: DevboxNode,
  dbprovider: DBProviderNode,
  network: NetworkNode,
};

export default nodeTypes;
