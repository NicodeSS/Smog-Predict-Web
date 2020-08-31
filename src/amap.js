import React from "react";

import privInfo from "./private";
import { Map } from "react-amap";

class MapComponent extends React.Component {
  constructor() {
    super();
    const self = this;
    this.mapPlugins = ["ToolBar"];
  }
  render() {
    return <Map amapkey={privInfo.AMAP_KEY} plugins={this.mapPlugins}></Map>;
  }
}
export default MapComponent;
