import { useState, useContext, FC, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Menu, MenuItem, Badge, Toolbar, Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Backdrop, CircularProgress } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AccountCircle from "@mui/icons-material/AccountCircle";
// import MailIcon from "@mui/icons-material/Mail";
// import NotificationsIcon from "@mui/icons-material/Notifications";
import { UserContext } from "./UserContext";
import axios from "axios";
import LogInForm from "./LogInForm";
import SignUpForm from "./SignUpForm";
import { useEffect } from "react";
import logo from "../images/logo.png";

const Header: FC = () => {
  const { user, setUser, logInDialog, setLogInDialog } = useContext(UserContext);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  // const [menu, setMenu] = useState(null);
  const [signUpDialog, setSignUpDialog] = useState({ open: false });
  const [accountImage, setAccountImage] = useState("");
  const [loading, setLoading] = useState(false);

  const isMenuOpen = !!anchorEl;
  // const isMobileMenuOpen = !!mobileMoreAnchorEl;

  const navigate = useNavigate();

  const openMenu = (e: MouseEvent<HTMLButtonElement>): void => setAnchorEl(e.currentTarget);
  const handleMobileMenuClose = (): void => {
    setMobileMoreAnchorEl(null);
  };

  const closeMenu = (): void => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const closeDialog = (): void => {
    logInDialog.open && setLogInDialog({ open: false });
    signUpDialog.open && setSignUpDialog({ open: false })
  };

  useEffect(() => {
    signUpDialog.open && setLogInDialog({ open: false });
  }, [signUpDialog]);

  useEffect(() => {
    logInDialog.open && setSignUpDialog({ open: false });
  }, [logInDialog]);

  const logout = (): void => {
    axios
      .get("/api/log-out")
      .then(() => {
        closeMenu();
        setUser(null);
        setLogInDialog({ open: true });
      })
  };

  useEffect(() => {
    user && user.image && setAccountImage(user.image.data);
  }, [user])
  // const handleMobileMenuOpen = (event) => {
  //   setMobileMoreAnchorEl(event.currentTarget);
  // };

  // useEffect(() => {
  //   axios.get("/api/menu")
  //     .then(({ data }) => setMenu(data));
  // }, []);

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      // transformOrigin = {{
      //   vertical: "top",
      //   horizontal: "right",
      // }}
      open={isMenuOpen}
      onClose={closeMenu}
    >
      <MenuItem
        onClick={() => {
          user ? navigate("/profile") : setLogInDialog({ open: true });
          closeMenu();
        }}
      >
        My Profile
      </MenuItem>
      <MenuItem
        onClick={() => {
          closeMenu();
          navigate("/my-advertisements");
        }}
      >
        My Advertisements
      </MenuItem>
      <MenuItem onClick={logout}>
        Log out
      </MenuItem>
    </Menu>
  );


  // const mobileMenuId = "primary-search-account-menu-mobile";
  // const renderMobileMenu = (
  //   <Menu
  //     anchorEl = {mobileMoreAnchorEl}
  //     anchorOrigin = {{
  //       vertical: "top",
  //       horizontal: "right",
  //     }}
  //     id={mobileMenuId}
  //     keepMounted
  //     transformOrigin={{
  //       vertical: "top",
  //       horizontal: "right",
  //     }}
  //     open={isMobileMenuOpen}
  //     onClose={handleMobileMenuClose}
  //   >
  //     <MenuItem>
  //       <IconButton size="large" aria-label="show 4 new mails" color="inherit">
  //         <Badge badgeContent={4} color="error">
  //           <MailIcon />
  //         </Badge>
  //       </IconButton>
  //       <p>Messages</p>
  //     </MenuItem>
  //     <MenuItem>
  //       <IconButton
  //         size="large"
  //         aria-label="show 17 new notifications"
  //         color="inherit"
  //       >
  //         <Badge badgeContent={17} color="error">
  //           <NotificationsIcon />
  //         </Badge>
  //       </IconButton>
  //       <p>Notifications</p>
  //     </MenuItem>
  //     <MenuItem onClick={openMenu}>
  //       <IconButton
  //         size="large"
  //         aria-label="account of current user"
  //         aria-controls="primary-search-account-menu"
  //         aria-haspopup="true"
  //         color="inherit"
  //       >
  //         <AccountCircle />
  //       </IconButton>
  //       <p>Profile</p>
  //     </MenuItem>
  //   </Menu>
  // );

  return (
    <Box sx={{ flexGrow: 1, zIndex: 10 }}>
      <AppBar position="static">
        <Toolbar>
          <div
            className="logo_container"
            onClick={() => window.location.href = "/"}
          >
            <img
              src={logo}
              alt="logo"
            />
          </div>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              size="large"
              aria-label="new_advertisement"
              color="inherit"
              onClick={() => user ?
                navigate("/new-advertisement") :
                setLogInDialog({ open: true })
              }
            >
              <AddCircleOutlineIcon />
            </IconButton>
            {user ?
              <Button
                size="large"
                aria-label="current_user_account"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={openMenu}
                color="inherit"
                endIcon={
                  <div className="account_image">
                    <img src={`data:image/png;base64,${accountImage}`} />
                  </div>
                }
                className="profile_button"
              >
                {user.name}
              </Button> :
              <IconButton
                size="large"
                edge="end"
                aria-label="current_user_account"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={() => setLogInDialog({ open: true })}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            }
          </Box>
          {/* <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box> */}
        </Toolbar>
      </AppBar>
      {/* {renderMobileMenu} */}
      {user && renderMenu}
      <Dialog
        open={logInDialog.open || signUpDialog.open}
        keepMounted
        onClose={closeDialog}
        aria-describedby="alert-dialog-slide-description"
        className="sign-up-dialog"
      >
        <DialogTitle>
          {signUpDialog.open ?
            "Create an Account" :
            "Log in"
          }
        </DialogTitle>
        <DialogContent className="dialog-content">
          {signUpDialog.open ?
            <SignUpForm setLoading={setLoading} /> :
            <LogInForm isOpen={logInDialog.open} setSignUpDialog={setSignUpDialog} setLoading={setLoading} />
          }
        </DialogContent>
        <Backdrop
          open={loading}
          className="backdrop"
        >
          <CircularProgress />
        </Backdrop>
      </Dialog>
    </Box>
  );
}

export default Header;