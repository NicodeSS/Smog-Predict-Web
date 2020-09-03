import React from "react";
import { Map, Marker } from "react-amap";

const layerStyle = {
  padding: "10px",
  background: "#121212",
  border: "1px solid #ddd",
  borderRadius: "4px",
  position: "absolute",
  top: "10px",
  left: "10px",
};

class MapComponent extends React.Component {
  constructor() {
    super();
    const self = this;
    this.map = null;
    this.marker = null;
    this.geocoder = null;
    this.geolocation = null;
    this.mapEvents = {
      created(map) {
        self.map = map;
        const AMap = window.AMap;
        AMap.plugin("AMap.Geocoder", () => {
          self.geocoder = new AMap.Geocoder({ city: "全国" });
        });
        AMap.plugin("AMap.Geolocation", () => {
          self.geolocation = new AMap.Geolocation({
            // geolocation timeout, default: inf
            timeout: 10000,
            //  adjust zoom when succeed, default: false
            zoomToAccuracy: true,
            showMarker: true,
            showCircle: true,
          });
          // add control privilege to geolocation
          self.map.addControl(self.geolocation);
          self.geolocation.getCurrentPosition();
          AMap.event.addListener(self.geolocation, "complete", onComplete);
          AMap.event.addListener(self.geolocation, "error", onError);
          function onComplete(data) {
            console.log(data);
            self.setState({ markerVisible: true });
            self.updateLocation(data.position);
          }

          function onError(data) {
            console.log(data);
            self.setState({ markerVisible: true });
          }
        });
      },
      click(e) {
        self.updateLocation(e.lnglat);
      },
    };
    this.markerEvents = {
      created: (marker) => {
        self.marker = marker;
      },
      dragend: (e) => {
        self.updateLocation(e.lnglat);
      },
    };
    this.state = {
      position: { longitude: 116.397264, latitude: 39.909146 },
      currentLocation: "点击地图任意位置",
      markerVisible: false,
    };
    this.mapPlugins = ["ToolBar"];
  }

  updateLocation(lnglat) {
    // Update position information
    this.setState({
      position: { longitude: lnglat.lng, latitude: lnglat.lat },
      currentLocation: "Loading...",
    });

    // Regeocode
    this.geocoder &&
      this.geocoder.getAddress(lnglat, (status, result) => {
        console.log(result);
        if (status === "complete") {
          if (result.regeocode) {
            this.setState({
              currentLocation: result.regeocode.formattedAddress || "未知地点",
            });
          } else {
            this.setState({
              currentLocation: "未知地点",
            });
          }
        } else {
          this.setState({
            currentLocation: "未知地点",
          });
        }
      });
  }
  render() {
    return (
      <Map
        events={this.mapEvents}
        center={this.state.position}
        amapkey={process.env.REACT_APP_AMAP_API_KEY}
        plugins={this.mapPlugins}
      >
        <Marker
          position={this.state.position}
          visible={this.state.markerVisible}
          events={this.markerEvents}
          draggable
        />
        <div className="location" style={layerStyle}>
          <h3>{this.state.currentLocation}</h3>
          经纬度:&nbsp;
          <strong>
            ({this.state.position.longitude},{this.state.position.latitude})
          </strong>
        </div>
      </Map>
    );
  }
}
export default MapComponent;
