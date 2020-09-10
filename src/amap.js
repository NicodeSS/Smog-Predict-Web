import React from "react";
import { Map, Marker } from "react-amap";
import LocationInfo from "./LocationInfo";

class MapComponent extends React.Component {
  constructor() {
    super();
    const self = this;
    this.map = null;
    this.marker = null;
    this.info = null;
    this.geocoder = null;
    this.geolocation = null;
    this.mapEvents = {
      created(map) {
        self.map = map;
        const AMap = window.AMap;
        // AMap.plugin("AMap.Geocoder", () => {
        //   self.geocoder = new AMap.Geocoder({ city: "全国" });
        // });
        AMap.plugin("AMap.Geolocation", () => {
          self.geolocation = new AMap.Geolocation({
            // geolocation timeout, default: inf
            timeout: 10000,
            //  adjust zoom when succeed, default: false
            zoomToAccuracy: true,
            showMarker: true,
            showCircle: false,
          });
          // add control privilege to geolocation
          self.map.addControl(self.geolocation);
          self.geolocation.getCurrentPosition();
          AMap.event.addListener(self.geolocation, "complete", onComplete);
          AMap.event.addListener(self.geolocation, "error", onError);
          function onComplete(data) {
            self.setState({ markerVisible: true });
            self.updateLocation(data.position);
          }

          function onError(data) {
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
      markerVisible: false,
    };
    this.mapPlugins = ["ToolBar"];
  }

  updateLocation(lnglat) {
    // Update position information
    this.setState({
      position: { longitude: lnglat.lng, latitude: lnglat.lat },
    });
    this.info && this.info.updateInfo({});
  }
  onRef = (ref) => {
    this.info = ref;
  };
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
        <LocationInfo
          className="location"
          onRef={this.onRef}
          geocoder={this.geocoder}
          longitude={this.state.position.longitude}
          latitude={this.state.position.latitude}
        />
      </Map>
    );
  }
}
export default MapComponent;
