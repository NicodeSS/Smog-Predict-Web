import React from "react";

import privInfo from "./private";
import { Map } from "react-amap";

class MapComponent extends React.Component {
  render() {
    return <Map amapkey={privInfo.AMAP_KEY} />;
  }
}
export default MapComponent;
