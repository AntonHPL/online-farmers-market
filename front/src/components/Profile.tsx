import { useState, useEffect, FC } from "react";
import {
  Breadcrumbs,
  Button,
  Link,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  DialogContentText
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { GeneralInfoContextInterface } from "../types";

const Profile: FC = () => {
  // const { user, isAccountImageChanged, setIsAccountImageChanged } = useContext(UserContext);
  const defaultOutletTitle = "My Profile";
  const [outletTitle, setOutletTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [changingAccountImage, setChangingAccountImage] = useState(false);
  const closeDialog = () => setIsDialogOpen(false);
  const navigate = useNavigate();

  const outletContext: GeneralInfoContextInterface = {
    changingAccountImage,
    closeDialog,
    outletTitle,
    setIsDialogOpen,
    setOutletTitle,
  };

  useEffect(() => {
    localStorage.getItem("ad-id_selected") ? setOutletTitle("My Chats") : setOutletTitle(defaultOutletTitle);
  }, []);

  useEffect(() => {
    outletTitle &&
      navigate(
        outletTitle === defaultOutletTitle ?
          "/profile/general-info" :
          outletTitle === "My Ads" ?
            "/profile/ads" :
            outletTitle === "My Chats" ?
              "/profile/chats" :
              "/"
      );
  }, [outletTitle]);

  return (
    <div className="profile-container">
      <Typography variant="h4">
        {outletTitle}
      </Typography>
      {outletTitle !== defaultOutletTitle &&
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            onClick={() => setOutletTitle("My Profile")}
          >
            My Profile
          </Link>
          <Typography color="text.primary">
            {outletTitle}
          </Typography>
        </Breadcrumbs>
      }
      <Outlet context={outletContext} />
      <Dialog
        open={isDialogOpen}
        keepMounted
        onClose={closeDialog}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          Please confirm the Action.
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Do you want to set this Image as your Profile Picture?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangingAccountImage(!changingAccountImage)}>
            Yes
          </Button>
          <Button onClick={closeDialog}>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Profile;