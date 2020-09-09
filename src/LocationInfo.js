import React from "react";
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  Grid,
  Slider,
  IconButton,
  Collapse,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
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
function getAQIColor(value, type) {
  let pos = type === "background" ? "backgroundColor" : "color";
  let pieces = [
    {
      gt: 0,
      lte: 50,
      color: "#5c5",
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
  let res = {};
  for (let i = 0; i < pieces.length; i++) {
    if (value > pieces[i].gt && (!pieces[i].lte || value <= pieces[i].lte)) {
      res[pos] = pieces[i].color;
      return res;
    }
  }
}
function getSmogColor(value) {
  let pieces = [
    {
      gt: 0,
      lte: 150,
      color: "#5c5",
    },
    {
      gt: 150,
      lte: 250,
      color: "#ffde33",
    },
    {
      gt: 250,
      lte: 500,
      color: "#ff9933",
    },
    {
      gt: 500,
      color: "#cc0033",
    },
  ];
  for (let i = 0; i < pieces.length; i++) {
    if (value > pieces[i].gt && (!pieces[i].lte || value <= pieces[i].lte)) {
      return { color: pieces[i].color };
    }
  }
}
function getSmogText(value) {
  let pieces = [
    {
      gt: 0,
      lte: 150,
      text: "无",
    },
    {
      gt: 150,
      lte: 250,
      text: "中度",
    },
    {
      gt: 250,
      lte: 500,
      text: "重度",
    },
    {
      gt: 500,
      text: "极重",
    },
  ];
  for (let i = 0; i < pieces.length; i++) {
    if (value > pieces[i].gt && (!pieces[i].lte || value <= pieces[i].lte)) {
      return pieces[i].text;
    }
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
      expanded: true,
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
    this.handleExpandClick = this.handleExpandClick.bind(this);
  }
  componentDidMount() {
    this.props.onRef(this);
    this.updateInfo();
  }
  handleExpandClick() {
    let cur = this.state.expanded;
    this.setState({ expanded: !cur });
  }
  render() {
    const sections = ["PM2.5", "PM10", "SO2", "NO2", "O3", "CO"];
    const gridList = sections.map((index) => (
      <Grid item xs={2}>
        <p>
          {index}
          <br />
          <span
            style={getTextColor(
              this.state.airQuality[this.state.slider][index],
              index
            )}
          >
            {this.state.airQuality[this.state.slider][index]}
          </span>
        </p>
      </Grid>
    ));
    return (
      <Card className="layer">
        <CardHeader
          title={this.state.currentLocation}
          style={getAQIColor(
            this.state.airQuality[this.state.slider]["AQI"],
            "background"
          )}
          action={
            <IconButton
              onClick={this.handleExpandClick}
              aria-expanded={this.state.expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          }
        />
        <Collapse in={this.state.expanded} timeout="auto">
          <CardContent>
            <Container>
              <Grid container spacing={1} className="air_quality">
                <Grid item xs={4}>
                  <p>
                    AQI
                    <br />
                    <span
                      style={getAQIColor(
                        this.state.airQuality[this.state.slider]["AQI"],
                        "text"
                      )}
                    >
                      {this.state.airQuality[this.state.slider]["AQI"]}
                    </span>
                  </p>
                </Grid>
                <Grid item xs={4}>
                  <p>
                    雾霾状况
                    <br />
                    <span
                      style={getSmogColor(
                        this.state.airQuality[this.state.slider]["PM2.5"]
                      )}
                    >
                      {getSmogText(
                        this.state.airQuality[this.state.slider]["PM2.5"]
                      )}
                    </span>
                  </p>
                </Grid>
                <Grid item xs={4}>
                  <p>
                    预测误差
                    <br />
                    <span
                      style={getAQIColor(
                        this.state.airQuality[this.state.slider]["AQI"],
                        "text"
                      )}
                    >
                      {this.state.airQuality[this.state.slider]["error"]}%
                    </span>
                  </p>
                </Grid>

                {gridList}

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
                  />
                </Grid>
              </Grid>
            </Container>
          </CardContent>
          <CardMedia>
            <ReactEcharts option={this.state.options} className="aqi_chart" />
          </CardMedia>
        </Collapse>
      </Card>
    );
  }

  async updateInfo() {
    let lnglat = [this.props.longitude, this.props.latitude];
    let location = await this.getLocation(lnglat);
    let airQuality = await this.getAirQuality(lnglat);
    let newState = {};
    Object.assign(newState, location, airQuality);
    console.log(newState);
    this.setState(newState);
  }
  async getAirQuality(lnglat) {
    try {
      let result = await axios.get("/predict", {
        longitude: lnglat.lng,
        latitude: lnglat.lat,
      });
      let data = result.data.data;
      data.options = {
        backgroundColor: "#ccc3",
        textStyle: {
          color: "#fff",
        },
        title: {
          text: "PM2.5",
          textStyle: {
            color: "#fff",
          },
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          data: data["PM2.5"].map(function (item) {
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
              lte: 150,
              color: "#5c5",
            },
            {
              gt: 150,
              lte: 250,
              color: "#ffde33",
            },
            {
              gt: 250,
              lte: 500,
              color: "#ff9933",
            },
            {
              gt: 500,
              color: "#cc0033",
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
            data: data["PM2.5"].map(function (item, index) {
              return index <= 24 ? item[1] : null;
            }),
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
            data: data["PM2.5"].map(function (item, index) {
              return index >= 24 ? item[1] : null;
            }),
          },
        ],
      };
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
