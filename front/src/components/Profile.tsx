import { useState, useEffect, FC } from "react";
import {
  Breadcrumbs,
  Link,
  Typography,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { ProfileContextInterface, ModifiedChatInterface } from "../types";
import ConfirmationDialog from "./ConfirmationDialog";

const Profile: FC = () => {
  // const { user, isAccountImageChanged, setIsAccountImageChanged } = useContext(UserContext);
  const defaultOutletTitle = "My Profile";
  const [outletTitle, setOutletTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [changingAccountImage, setChangingAccountImage] = useState(false);
  const closeDialog = () => setIsDialogOpen(false);
  const navigate = useNavigate();

  const outletContext: ProfileContextInterface = {
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
      <ConfirmationDialog
        open={isDialogOpen}
        closeDialog={closeDialog}
        changingAccountImage={changingAccountImage}
        setChangingAccountImage={setChangingAccountImage}
      />
    </div>
  );
};

export default Profile;