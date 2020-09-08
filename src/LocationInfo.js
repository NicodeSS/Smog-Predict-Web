import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  Grid,
  Slider,
} from "@material-ui/core";
import ReactEcharts from "echarts-for-react";
import axios from "./plugins/axios";
import axiosOrig from "axios";
import "./LocationInfo.css";

function sliderText(value) {
  switch (value) {
    case 0:
      return "现在";
    case 1:
      return "1h";
    case 3:
      return "3h";
    case 12:
      return "12h";
    default:
      return "未知";
  }
}

function getTextColor(value, type) {
  let color = null;
  let thershold1 = {
    "PM2.5": 35,
    PM10: 70,
    SO2: 60,
    NO2: 40,
    O3: 160,
    CO: 4,
  };
  let thershold2 = {
    "PM2.5": 75,
    PM10: 150,
    SO2: 150,
    NO2: 80,
    O3: 200,
    CO: 10,
  };
  color =
    value < thershold1[type]
      ? "#5c5"
      : value < thershold2[type]
      ? "yellow"
      : "red";
  return { color: color };
}
function getTitleColor(value) {
  let pieces = [
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
  ];
  for (let i = 0; i < pieces.length; i++) {
    if (value > pieces[i].gt && (!pieces[i].lte || value <= pieces[i].lte))
      return { backgroundColor: pieces[i].color };
  }
}

class LocationInfo extends React.Component {
  constructor(props) {
    super(props);
    const self = this;
    const AMap = window.AMap;
    AMap.plugin("AMap.Geocoder", () => {
      self.geocoder = new AMap.Geocoder({ city: "全国" });
    });
    this.state = {
      currentLocation: "Test",
      lng: 0,
      lat: 0,
      options: {},
      airQuality: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      slider: 0,
    };
    this.marks = [
      {
        value: 0,
        label: "现在",
      },
      {
        value: 1,
        label: "1h",
      },
      {
        value: 3,
        label: "3h",
      },
      {
        value: 12,
        label: "12h",
      },
    ];
    this.slider = 0;
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
          style={getTitleColor(this.state.airQuality[this.state.slider]["AQI"])}
        />
        <CardContent>
          <p>
            经纬度:{this.state.lng},{this.state.lat}
          </p>
          <p>AQI: {this.state.airQuality[this.state.slider]["AQI"]}</p>
          <Grid container spacing={2} className="air_quality">
            <Grid item xs={2}>
              <p>
                PM2.5
                <br />
                <span
                  style={getTextColor(
                    this.state.airQuality[this.state.slider]["PM2.5"],
                    "PM2.5"
                  )}
                >
                  {this.state.airQuality[this.state.slider]["PM2.5"]}
                </span>
              </p>
            </Grid>
            <Grid item xs={2}>
              <p>
                PM10
                <br />
                <span
                  style={getTextColor(
                    this.state.airQuality[this.state.slider]["PM10"],
                    "PM10"
                  )}
                >
                  {this.state.airQuality[this.state.slider]["PM10"]}
                </span>
              </p>
            </Grid>
            <Grid item xs={2}>
              <p>
                SO2
                <br />
                <span
                  style={getTextColor(
                    this.state.airQuality[this.state.slider]["SO2"],
                    "SO2"
                  )}
                >
                  {this.state.airQuality[this.state.slider]["SO2"]}
                </span>
              </p>
            </Grid>
            <Grid item xs={2}>
              <p>
                NO2
                <br />
                <span
                  style={getTextColor(
                    this.state.airQuality[this.state.slider]["NO2"],
                    "NO2"
                  )}
                >
                  {this.state.airQuality[this.state.slider]["NO2"]}
                </span>
              </p>
            </Grid>
            <Grid item xs={2}>
              <p>
                O3
                <br />
                <span
                  style={getTextColor(
                    this.state.airQuality[this.state.slider]["O3"],
                    "O3"
                  )}
                >
                  {this.state.airQuality[this.state.slider]["O3"]}
                </span>
              </p>
            </Grid>
            <Grid item xs={2}>
              <p>
                CO
                <br />
                <span
                  style={getTextColor(
                    this.state.airQuality[this.state.slider]["CO"],
                    "CO"
                  )}
                >
                  {this.state.airQuality[this.state.slider]["CO"]}
                </span>
              </p>
            </Grid>
            <Grid item xs={12}>
              <Slider
                defaultValue={0}
                getAriaValueText={sliderText}
                aria-labelledby="discrete-slider-restrict"
                step={null}
                min={0}
                max={12}
                marks={this.marks}
                onChange={(e, v) => {
                  this.setState({ slider: v });
                }}
              ></Slider>
            </Grid>
          </Grid>
        </CardContent>
        <CardMedia>
          <ReactEcharts option={this.state.options} className="aqi_chart" />
        </CardMedia>
      </Card>
    );
  }

  async updateInfo() {
    let lnglat = [this.props.longitude, this.props.latitude];
    let location = await this.getLocation(lnglat);
    let airQuality = await this.getAirQuality(lnglat);
    let options = await this.getOptions(lnglat);
    let newState = {};
    Object.assign(newState, location, airQuality, options);
    console.log(newState);
    this.setState(newState);
  }
  async getOptions(lnglat) {
    try {
      let result = await axios.get("test.json", { lnglat: lnglat });
      let data = result.data;
      return {
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
      };
    } catch (err) {
      console.log(err);
    }
  }
  async getAirQuality(lnglat) {
    try {
      let result = await axios.get("air_quality.json", { lnglat: lnglat });
      let data = result.data.data;
      return data;
    } catch (err) {
      console.log(err);
    }
  }
  async getLocation(lnglat) {
    try {
      let result = await new Promise((resolve, reject) => {
        axiosOrig({
          method: "GET",
          url: "https://restapi.amap.com/v3/geocode/regeo",
          params: {
            key: process.env.REACT_APP_AMAP_API_KEY,
            s: "rsv3",
            language: "zh-cn",
            location: lnglat[0] + "," + lnglat[1],
          },
        })
          .then(function (res) {
            res.status === 200 && res.data.info === "OK"
              ? resolve(res)
              : reject(res);
          })
          .catch(function (err) {
            reject(err);
          });
      });
      let data = result.data.regeocode
        ? {
            currentLocation:
              result.data.regeocode.formatted_address || "未知地点",
            lng: lnglat[0],
            lat: lnglat[1],
          }
        : {
            currentLocation: "未知地点",
            lng: lnglat[0],
            lat: lnglat[1],
          };
      return data;
    } catch (err) {
      console.log(err);
    }
  }
}

export default LocationInfo;
