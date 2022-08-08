import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AdInterface, SellerInterface } from "../types";
import FirstMessageDialog from "./FirstMessageDialog";

const Ad = () => {
  const params = useParams();
  const paramsId: string = params.id || "";
  const navigate = useNavigate();
  const [ad, setAd] = useState<AdInterface | null>(null);
  const [marginLeft, setMarginLeft] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [messageText, setMessageText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [seller, setSeller] = useState<SellerInterface | null>(null);

  useEffect(() => {
    axios
      .get(`/api/ad/${paramsId}`)
      .then(({ data }) => setAd(data));
  }, []);

  useEffect(() => {
    ad &&
      axios
        .get(`/api/seller/${ad.textInfo.sellerId}`)
        .then(({ data }) => setSeller(data[0]))
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

  const closeDialog = () => setIsDialogOpen(false);

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