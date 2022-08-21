import { useState, useEffect, useContext, FC } from 'react';
import { useProfileContext } from '../functions/functions';
import { UserContext } from "./UserContext";
import { Button, Paper, IconButton, Typography } from "@mui/material";
import { AccountCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from "axios";

const GeneralInfo: FC = () => {
  const [accountImage, setAccountImage] = useState("");
  const { changingAccountImage, closeDialog, outletTitle, setIsDialogOpen, setOutletTitle } = useProfileContext();
  const [imageToUpload, setImageToUpload] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const { user, isAccountImageChanged, setIsAccountImageChanged } = useContext(UserContext);

  useEffect(() => {
    outletTitle !== "My Profile" && setOutletTitle("My Profile");
  }, []);

  useEffect(() => {
    imageToUpload && setIsDialogOpen(true);
  }, [imageToUpload]);

  useEffect(() => {
    if (imageToUpload) {
      const fd = new FormData();
      user && fd.append("userId", user._id);
      fd.append("imageInput", imageToUpload);
      axios
        .put("/api/account-image", fd)
        .then(() => {
          setIsAccountImageChanged(!isAccountImageChanged)
          setLoading(false);
          closeDialog();
        });
    }
  }, [changingAccountImage]);
  useEffect(() => {
    user && user.image && setAccountImage(user.image.data);
  }, [user]);

  const Input = styled('input')({
    display: 'none',
  });

  return (
    <Paper className="general-info">
      <div>
        <label htmlFor="icon-button-file">
          <Input
            id="icon-button-file"
            accept="image/*"
            type="file"
            name="imageInput"
            onChange={e =>
              e.target.files && setImageToUpload(e.target.files[0])
            }
          />
          <IconButton component="span" size="large" className="icBut">
            {user?.image ?
              <div className="image">
                <img src={`data:image/png;base64,${accountImage}`} />
              </div> :
              <AccountCircle />}
          </IconButton>
        </label>
        <div>
          <Typography variant="h5">
            {user?.name}
          </Typography>
          <Typography variant="body2">
            {user &&
              `On Online Farmer's Market: since ${new Date(user.registrationDate)
                .toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              }.`
            }
          </Typography>
        </div>
      </div>
      <div>
        <Paper className="email">
          <Typography variant="body1">
            Email: {user?.email}
          </Typography>
        </Paper>
        <div className="buttons">
          <Button
            onClick={() => setOutletTitle("My Ads")}
            variant="contained"
          >
            My Ads
          </Button>
          <Button
            onClick={() => setOutletTitle("My Chats")}
            variant="contained"
          >
            My Chats
          </Button>
        </div>
      </div>
    </Paper>
  );
};

export default GeneralInfo;