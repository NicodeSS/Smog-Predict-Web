import React from "react";
import { Card, CardHeader, CardContent } from "@material-ui/core";
import ReactEcharts from "echarts-for-react";
import axios from "./plugins/axios";
import "./LocationInfo.css";

class LocationInfo extends React.Component {
  constructor(props) {
    super(props);
    const self = this;
    const AMap = window.AMap;
    AMap.plugin("AMap.Geocoder", () => {
      self.geocoder = new AMap.Geocoder({ city: "全国" });
    });
    this.state = { currentLocation: "Test", lng: 0, lat: 0, options: {} };
  }
  componentDidMount() {
    this.props.onRef(this);
    this.updateInfo();
  }
  render() {
    return (
      <Card className="layer">
        <CardHeader
          title={this.state.currentLocation}
          style={{ "background-color": "red" }}
        />
        <CardContent>
          {this.state.lng},{this.state.lat}
          <ReactEcharts option={this.state.options} className="aqi_chart" />
        </CardContent>
      </Card>
    );
  }

  async updateInfo() {
    let lnglat = [this.props.longitude, this.props.latitude];
    this.getOptions();
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
  async getOptions() {
    try {
      let result = await axios.get("test.json");
      let data = result.data;
      this.setState({
        options: {
          backgroundColor: "#ccc3",
          textStyle: {
            color: "#fff",
          },
          title: {
            text: "Beijing AQI",
            textStyle: {
              color: "#fff",
            },
          },
          tooltip: {
            trigger: "axis",
          },
          xAxis: {
            data: data.map(function (item) {
              return item[0];
            }),
            axisLine: {
              lineStyle: {
                color: "#ccc",
              },
            },
          },
          yAxis: {
            splitLine: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: "#ccc",
              },
            },
          },
          visualMap: {
            top: 10,
            right: 10,
            show: false,
            pieces: [
              {
                gt: 0,
                lte: 50,
                color: "#096",
              },
              {
                gt: 50,
                lte: 100,
                color: "#ffde33",
              },
              {
                gt: 100,
                lte: 150,
                color: "#ff9933",
              },
              {
                gt: 150,
                lte: 200,
                color: "#cc0033",
              },
              {
                gt: 200,
                lte: 300,
                color: "#660099",
              },
              {
                gt: 300,
                color: "#7e0023",
              },
            ],
            outOfRange: {
              color: "#999",
            },
          },
          series: [
            {
              name: "历史数据",
              type: "line",
              showSymbol: false,
              data: data.map(function (item, index) {
                return index <= 24 ? item[1] : null;
              }),
              markLine: {
                silent: true,
                data: [
                  {
                    yAxis: 50,
                  },
                  {
                    yAxis: 100,
                  },
                  {
                    yAxis: 150,
                  },
                  {
                    yAxis: 200,
                  },
                  {
                    yAxis: 300,
                  },
                ],
              },
            },
            {
              name: "预测数据",
              type: "line",
              showSymbol: false,
              smooth: false,
              itemStyle: {
                normal: {
                  lineStyle: {
                    width: 3,
                    type: "dotted", //'dotted'虚线 'solid'实线
                  },
                },
              },
              data: data.map(function (item, index) {
                return index >= 24 ? item[1] : null;
              }),
              markLine: {
                silent: true,
                data: [
                  {
                    yAxis: 50,
                  },
                  {
                    yAxis: 100,
                  },
                  {
                    yAxis: 150,
                  },
                  {
                    yAxis: 200,
                  },
                  {
                    yAxis: 300,
                  },
                ],
              },
            },
          ],
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export default LocationInfo;
