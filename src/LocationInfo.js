import React from "react";
import Card from "@material-ui/core/Card";
import { CardHeader } from "@material-ui/core";

const layerStyle = {
  position: "absolute",
  top: "10px",
  left: "10px",
};

class LocationInfo extends React.Component {
  constructor(props) {
    super(props);
    console.log("Props:", props);
    const self = this;
    const AMap = window.AMap;
    AMap.plugin("AMap.Geocoder", () => {
      self.geocoder = new AMap.Geocoder({ city: "全国" });
    });
    this.state = { currentLocation: "Test", lng: 0, lat: 0 };
  }
  componentDidMount() {
    this.props.onRef(this);
    this.updateInfo();
  }
  render() {
    return (
      <Card style={layerStyle}>
        <CardHeader
          className="classes.header"
          title={this.state.currentLocation}
          style={{ "background-color": "red" }}
        />
        {this.state.lng},{this.state.lat}
      </Card>
    );
  }

  async updateInfo() {
    let lnglat = [this.props.longitude, this.props.latitude];
    console.log(lnglat, typeof lnglat);
    this.geocoder &&
      (await this.geocoder.getAddress(lnglat, (status, result) => {
        console.log(result);
        if (status === "complete") {
          if (result.regeocode) {
            this.setState({
              currentLocation: result.regeocode.formattedAddress || "未知地点",
              lng: lnglat[0],
              lat: lnglat[1],
            });
          } else {
            this.setState({
              currentLocation: "未知地点",
              lng: lnglat[0],
              lat: lnglat[1],
            });
          }
        } else {
          this.setState({
            currentLocation: "未知地点",
            lng: lnglat[0],
            lat: lnglat[1],
          });
        }
      }));
  }
}

export default LocationInfo;
