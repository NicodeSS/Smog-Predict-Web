import React from "react";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import "./App.css";

import MapComponent from "./amap";

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#5c5",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <div className="App">
        <MapComponent />
      </div>
    </ThemeProvider>
  );
}

export default App;
