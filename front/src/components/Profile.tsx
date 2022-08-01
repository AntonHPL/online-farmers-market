import { useState, useEffect, useContext, FC, ChangeEvent } from "react";
import { Breadcrumbs, Button, Link, IconButton, Paper, Typography, Tooltip, Dialog, DialogContent, DialogActions, DialogTitle, DialogContentText } from "@mui/material";
import { AccountCircle, Send } from "@mui/icons-material";
import { UserContext } from "./UserContext";
import axios from "axios";
import { styled } from '@mui/material/styles';
import { Outlet, useNavigate } from "react-router-dom";
import Chats from "./Chats";
import Header from "./Header";

const Profile: FC = () => {
    const { user, isAccountImageChanged, setIsAccountImageChanged } = useContext(UserContext);
    const [outletTitle, setOutletTitle] = useState("");
    const [imageToUpload, setImageToUpload] = useState<File | null>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [accountImage, setAccountImage] = useState("");
    const [confirmationDialog, setConfirmationDialog] = useState({ open: false });
    const [changingAccountImage, setChangingAccountImage] = useState(false);

    const Input = styled('input')({
        display: 'none',
    });

    useEffect(() => {
        user && user.image && setAccountImage(user.image.data);
    }, [user]);

    useEffect(() => {
        imageToUpload && setConfirmationDialog({ open: true });
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
                    closeConfirmationDialog();
                });
        }
    }, [changingAccountImage]);

    const closeConfirmationDialog = () => setConfirmationDialog({ open: false });

    return (
        <>
            <div className="profile_container">
                <Typography variant="h4">
                    My Profile
                </Typography>
                <Paper>
                    <div className="profile-image_container">
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
                                {true ?
                                    <div className="account_image">
                                        <img src={`data:image/png;base64,${accountImage}`} />
                                    </div> :
                                    <AccountCircle className="account_circle" />}
                            </IconButton>
                        </label>
                        <Typography variant="h5">
                            Anton
                        </Typography>
                    </div>
                    <table>
                        <tr>
                            <th>Email:</th>
                            <td>antonhpl@mail.ru</td>
                        </tr>
                        <tr>
                            <th>Name:</th>
                            <td>Anton</td>
                        </tr>
                    </table>
                </Paper>
                {outletTitle ?
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link
                            underline="hover"
                            color="inherit"
                            onClick={() => {
                                navigate("/profile");
                                setOutletTitle("");
                            }}
                        >
                            My Profile
                        </Link>
                        <Typography color="text.primary">
                            {outletTitle}
                        </Typography>
                    </Breadcrumbs> :
                    <Button onClick={() => {
                        navigate("/profile/chats");
                        setOutletTitle("My Chats");
                    }}>
                        My Chats
                    </Button>
                }
                <Outlet />
                <Dialog
                    open={confirmationDialog.open}
                    keepMounted
                    onClose={closeConfirmationDialog}
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle>
                        Wait a Minute!
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
                        <Button onClick={closeConfirmationDialog}>
                            No
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
};

export default Profile;