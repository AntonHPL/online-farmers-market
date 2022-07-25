import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import NewAd from "./components/NewAd";
import Ads from "./components/Ads";
import { createTheme, ThemeProvider } from "@mui/material";
import { orange } from "@mui/material/colors";
import { WithUserContext } from "./components/UserContext";
import Profile from "./components/Profile";
import "./App.scss";

const theme = createTheme({
  palette: {
    primary: {
      main: orange[500],
      light: orange[50]
    },
    secondary: { main: orange[50] },
  }
})
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<WithUserContext children={<Ads />} />}
          />
          <Route path="/new-advertisement" element={<WithUserContext children={<NewAd />} />} />
          <Route path="/dashboard" element={<WithUserContext children={<Ads />} />} />
          <Route path="/profile" element={<WithUserContext children={<Profile />} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App;