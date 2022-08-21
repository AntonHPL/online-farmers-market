import { FC } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  DialogContentText
} from "@mui/material";
import { ConfirmationDialogPropsInterface } from "../types";

const ConfirmationDialog: FC<ConfirmationDialogPropsInterface> = ({ open, closeDialog, changingAccountImage, setChangingAccountImage }) => {
  return (
    <Dialog
      open={open}
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
  );
};

export default ConfirmationDialog;