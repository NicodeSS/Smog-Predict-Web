import React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  Container,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Slider,
  Paper,
  TableCell,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { AutoSizer, Column, Table } from "react-virtualized";
import ReactEcharts from "echarts-for-react";
import axios from "./plugins/axios";
import axiosOrig from "axios";
import "./LocationInfo.css";
import "react-virtualized/styles.css";

let headCells = [
  { width: 160, dataKey: "province", label: "省份" },
  { width: 120, dataKey: "city", label: "城市" },
  { width: 160, dataKey: "station", label: "站点" },
  { width: 45, dataKey: "aqi", label: "AQI" },
  { width: 45, dataKey: "pm2_5", label: "PM2.5" },
  { width: 45, dataKey: "pm10", label: "PM10" },
  { width: 45, dataKey: "so2", label: "SO2" },
  { width: 45, dataKey: "no2", label: "NO2" },
  { width: 45, dataKey: "o3", label: "O3" },
  { width: 45, dataKey: "co", label: "CO" },
];
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

class MuiVirtualizedTable extends React.PureComponent {
  static defaultProps = {
    headerHeight: 45,
    rowHeight: 35,
  };

  cellRenderer = ({ cellData }) => {
    const { rowHeight } = this.props;
    return (
      <TableCell
        variant="body"
        className="table-cell"
        style={{ height: rowHeight }}
        align="center"
      >
        {cellData}
      </TableCell>
    );
  };

  headerRenderer = ({ dataKey, label }) => {
    const { headerHeight } = this.props;
    return (
      <TableCell
        key={dataKey}
        className="table-cell"
        variant="head"
        style={{ height: headerHeight }}
        align="center"
      >
        {label}
      </TableCell>
    );
  };

  render() {
    const { columns, rowHeight, headerHeight, ...tableProps } = this.props;
    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            stickyHeader
            size="small"
            height={height}
            width={width}
            rowHeight={rowHeight}
            gridStyle={{
              direction: "inherit",
            }}
            headerHeight={headerHeight}
            {...tableProps}
          >
            {columns.map(({ dataKey, ...other }, index) => {
              return (
                <Column
                  key={dataKey}
                  headerRenderer={(headerProps) =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index,
                    })
                  }
                  cellRenderer={this.cellRenderer}
                  dataKey={dataKey}
                  {...other}
                />
              );
            })}
          </Table>
        )}
      </AutoSizer>
    );
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
      dialog: false,
      station: [],
      order: "desc",
      orderBy: "aqi",
    };
    this.marks = [
      {
        value: 0,
        label: "现在",
      },
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 },
      { value: 6 },
      { value: 7 },
      { value: 8 },
      { value: 9 },
      { value: 10 },
      { value: 11 },
      {
        value: 12,
        label: "12h",
      },
    ];
    this.slider = 0;
    this.handleExpandClick = this.handleExpandClick.bind(this);
    this.handleDialogClick = this.handleDialogClick.bind(this);
  }
  componentDidMount() {
    this.props.onRef(this);
    this.updateInfo();
    this.getStationAqi();
  }
  handleExpandClick() {
    let cur = this.state.expanded;
    this.setState({ expanded: !cur });
  }
  handleDialogClick() {
    this.setState({ dialog: !this.state.dialog });
  }
  render() {
    const sections = ["PM2.5", "PM10", "SO2", "NO2", "O3", "CO"];
    const gridList = sections.map((index) => (
      <Grid item xs={2}>
        <p>
          {index}
          <br />
          <span
            className="card-text"
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
    const aqiDialog = (
      <Dialog
        fullScreen
        className="aqi-dialog"
        open={this.state.dialog}
        onClose={this.handleDialogClick}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">全国AQI排名</DialogTitle>
        <DialogContent>
          <div className="table-paper">
            <MuiVirtualizedTable
              rowCount={this.state.station.length}
              rowGetter={({ index }) => this.state.station[index]}
              columns={headCells}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button size="small" color="primary" onClick={this.handleDialogClick}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    );
    return (
      <Card className="layer">
        <CardHeader
          title={this.state.currentLocation}
          className="card-title"
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
                      className="card-text"
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
                      className="card-text"
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
                      className="card-text"
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
                    color="primary"
                    defaultValue={0}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => (v ? v + "h" : "现在")}
                    aria-labelledby="discrete-slider"
                    step={1}
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
            <ReactEcharts option={this.state.options} className="pm2_5_chart" />
          </CardMedia>
          <CardActions>
            <Button
              size="small"
              color="primary"
              onClick={this.handleDialogClick}
            >
              查看全国AQI排名
            </Button>
          </CardActions>
        </Collapse>
        {aqiDialog}
      </Card>
    );
  }

  async updateInfo() {
    let lnglat = [this.props.longitude, this.props.latitude];
    let location = await this.getLocation(lnglat);
    let airQuality = await this.getAirQuality(lnglat);
    let newState = {};
    Object.assign(newState, location, airQuality);
    this.setState(newState);
  }
  async getAirQuality(lnglat) {
    try {
      let result = await axios.get("/predict", {
        longitude: lnglat[0],
        latitude: lnglat[1],
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
      console.error(err);
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
      console.error(err);
    }
  }
  async getStationAqi() {
    try {
      let result = await axios.get("/getChinaAqi");
      let data = result.data.data;
      this.setState(data);
    } catch (error) {
      console.error(error);
    }
  }
}

export default LocationInfo;
