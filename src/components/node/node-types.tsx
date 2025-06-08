import React from "react";
import DevboxNode from "./devbox-node";

const nodeTypes = {
  devbox: (props: any) => <DevboxNode {...props} onClick={props.onClick} />
};

export default nodeTypes;