import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, TextField, Button } from "@mui/material";
import axios from "axios";
import { UserContext } from "./UserContext";
import { AdType } from "../types";

const Ad = () => {
  interface SellerType {
    name: string,
    image: string,
  };
  const params = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState<AdType | null>(null);
  const [marginLeft, setMarginLeft] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [message, setMessage] = useState("");
  const [dialog, setDialog] = useState({ open: false });
  const [seller, setSeller] = useState<SellerType | null>(null);

  const { user } = useContext(UserContext);

  useEffect(() => {
    axios.get(`/api/ad/${params.id}`).then(({ data }) => setAd(data));
  }, []);

  useEffect(() => {
    ad && axios.get(`/api/seller/${ad.textInfo.sellerId}`).then(({ data }) => setSeller({ name: data[0].name, image: data[0].image.data }))
  }, [ad]);

  const startConversation = () => {
    ad &&
      axios
        .get(`/api/chat/${ad._id}`)
        .then(({ data }) => {
          if (data) {
            navigate("/profile/chats");
            localStorage.setItem("ad-id_selected", ad._id);
          } else {
            setDialog({ open: true })
          }
        });
  };

  const closeDialog = () => setDialog({ open: false });
  const sendMessage = () => {
    const creationDate = new Date().toISOString();
    axios
      .post("/api/chat", {
        adId: params.id,
        creationDate,
        messages: [{ senderId: user?._id, message, creationDate }],
        participants: [{ name: user?.name, id: user?._id }, { name: ad?.textInfo.sellerName, id: ad?.textInfo.sellerId }],
      })
      .then(() => {
        setMessage("");
        closeDialog();
      })
  };

  return (
    <div className="ad_container">
      <div className="slider">
        <div className="slides">
          {ad &&
            <>
              <div
                className="slide"
                style={{ marginLeft: marginLeft }}
              >
                <img src={`data:image/png;base64,${ad.images[0].data}`} />
              </div>
              {ad.images.map((el, i) => {
                if (i !== 0) {
                  return (
                    <div className="slide">
                      <img src={`data:image/png;base64,${el.data}`} />
                    </div>
                  )
                }
              })}
            </>
          }
          {/* <div className="navigation-auto">
            <div className="auto-btn1"></div>
            <div className="auto-btn2"></div>
          </div> */}
        </div>
        <div className="navigation-manual">
          {ad &&
            function () {
              let content = [];
              for (let i = 0; i < ad.images.length; i++) {
                content.push(
                  <div
                    className={i === selectedImage ? "selected_manual-button" : "manual-btn"}
                    onClick={() => {
                      setMarginLeft(`${i * (-20)}%`);
                      setSelectedImage(i);
                    }}
                  >
                  </div>
                );
              };
              return content;
            }()}
        </div>
      </div>
      <button onClick={() => startConversation()}>Talk to Author</button>
      <Dialog
        open={dialog.open}
        keepMounted
        onClose={closeDialog}
        aria-describedby="alert-dialog-slide-description"
        className="first-message_dialog"
      >
        <DialogTitle>
          {seller &&
            <div className="seller_info">
              <div className="seller-account_image">
                <img src={`data:image/png;base64,${seller.image}`} />
              </div>
              {seller.name}
            </div>
          }
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <TextField
              required
              type="text"
              size="small"
              variant="outlined"
              value={message}
              autoComplete="off"
              placeholder="Enter your Message"
              onChange={e => setMessage(e.target.value)}
              // className="form_row"
              multiline
              rows={4}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>
            Quit
          </Button>
          <Button
            disabled={!message}
            onClick={sendMessage}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Ad;