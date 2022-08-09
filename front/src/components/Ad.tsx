import { useState, useEffect, ReactElement } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AdInterface, SellerInterface } from "../types";
import FirstMessageDialog from "./FirstMessageDialog";
import ImageSlider from "./ImageSlider";
import { Button, Typography, Skeleton, Paper } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";

const Ad = () => {
  const params = useParams();
  const paramsId: string = params.id || "";
  const navigate = useNavigate();
  const [ad, setAd] = useState<AdInterface | null>(null);

  const [messageText, setMessageText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [seller, setSeller] = useState<SellerInterface | null>(null);

  useEffect(() => {
    axios
      .get(`/api/ad/${paramsId}`)
      .then(({ data }) => setAd(data))
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    ad &&
      axios
        .get(`/api/seller/${ad.textInfo.sellerId}`)
        .then(({ data }) => setSeller(data[0]))
        .catch(error => console.error(error));
  }, [ad]);

  const startConversation = (): void => {
    ad &&
      axios
        .get(`/api/chat/${ad._id}`)
        .then(({ data }) => {
          if (data) {
            navigate("/profile/chats");
            localStorage.setItem("ad-id_selected", ad._id);
          } else {
            setIsDialogOpen(true)
          }
        });
  };

  const closeDialog = (): void => setIsDialogOpen(false);
  const writeToTheSellerButton = (): ReactElement => {
    return (
      <Button
        variant="contained"
        onClick={startConversation}
        className="write-to-the-seller-button"
      >
        Write to the Seller
      </Button>
    )
  };
  const skeleton = (extraClass: string): ReactElement => {
    return (
      <Skeleton
        variant="rectangular"
        className={`skeleton-${extraClass}`}
      />
    )
  }
  return (
    <div className="ad-container">
      <ImageSlider ad={ad} />
      <div className="aside">
        {ad ?
          <Paper>
            <Typography variant="h5">
              {ad.textInfo.price ? `$${ad.textInfo.price}` : "For free"}
            </Typography>
            <Typography variant="h5">
              {ad.textInfo.title}
            </Typography>
            <br />
            <Typography variant="body2">
              Located in {ad.textInfo.region}, {ad.textInfo.city}.
            </Typography>
            <Typography variant="body2">
              Created on&nbsp;
              {ad.creationDate &&
                new Date(ad.creationDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}.
            </Typography>
          </Paper> :
          skeleton("aside-top")
        }
        {seller ?
          <Paper>
            <Typography variant="h6">
              About Seller
            </Typography>
            <div className="seller-info">
              <div className="account">
                <div className="image">
                  {seller.image ?
                    <img src={`data:image/png;base64,${seller.image.data}`} /> :
                    <AccountCircle />
                  }
                </div>
                <Typography variant="body1">
                  {seller.name}
                </Typography>
              </div>
              <Typography variant="body2">
                On Online Farmer's Market: since {
                  new Date(seller.registrationDate).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })
                }.
              </Typography>
              {writeToTheSellerButton()}
            </div>
          </Paper> :
          skeleton("aside-bottom")
        }
      </div>
      {ad ?
        <Paper className="description">
          <Typography variant="h6">
            Description
          </Typography>
          <Typography variant="body1">
            {ad?.textInfo.description}
          </Typography>
        </Paper> :
        skeleton("description")
      }
      {seller ?
        <Paper className="questions">
          <Typography variant="h6">
            Interested?
          </Typography>
          <Typography variant="body1">
            Ask the Seller one of the Questions proposed...
          </Typography>
          <Button variant="outlined">
            Not sold yet?
          </Button>
          <Button variant="outlined">
            How to pick up the goods?
          </Button>
          <Button variant="outlined">
            Is the price negotiable?
          </Button>
          <Typography variant="body1">
            ...or write your own...
          </Typography>
          {writeToTheSellerButton()}
        </Paper> :
        skeleton("questions")
      }
      <FirstMessageDialog
        open={isDialogOpen}
        closeDialog={closeDialog}
        seller={seller}
        messageText={messageText}
        setMessageText={setMessageText}
        ad={ad}
        paramsId={paramsId}
      />
    </div>
  );
};

export default Ad;