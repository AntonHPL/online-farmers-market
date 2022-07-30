import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import NewAd from "./components/NewAd";
import Ad from "./components/Ad";
import Ads from "./components/Ads";
import Header from "./components/Header";
import { createTheme, ThemeProvider } from "@mui/material";
import { orange } from "@mui/material/colors";
import Profile from "./components/Profile";
import "./App.scss";
import Chats from "./components/Chats";

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
        <Header />
        <Routes>
          <Route path="/" element={<Ads />}/>
          <Route path="/ad/:id" element={<Ad />} />
          <Route path="/new-advertisement" element={<NewAd />} />
          <Route path="/profile" element={<Profile />}>
            <Route path="chats" element={<Chats />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App;