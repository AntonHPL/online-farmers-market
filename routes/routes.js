const express = require('express');
const multer = require("multer");

const {
  getAds,
  countAds,
  getImages,
  getMenu,
  getRegions,
  getUser,
  validateToken,
  verifyEmail,
  logOut,
  postAd,
  addAccountImage,
  logIn,
  signUp,
  finishAd,
  addImages,
  getMyAds,
  deleteImage,
  deleteAd,
  deleteUnsavedAd,
  postChat,
  getChats,
  addMessages,
  getAccountImage,
  getChat,
  getAd,
  getSeller,
  getAdsBriefly,
  getSellers,
  determineChatExistence,
  deleteChat,
} = require("./controllers")

const router = express.Router();
const storage = multer.diskStorage({});

const upload = multer({ storage: storage });

router.get("/api/log-out", logOut);
router.get("/api/ads", getAds);
router.get("/api/count_ads", countAds);
router.get("/api/images/:creationDate", getImages);
router.get('/api/menu', getMenu);
router.get("/api/regions", getRegions);
router.get("/api/chats-briefly/:userId", getChats);
router.get("/api/user/:id", getUser);
router.get("/api/validate-token", validateToken);
router.get("/api/account-image/:userId", getAccountImage);
router.get("/api/ad/:id", getAd);
router.get("/api/seller/:id", getSeller);
router.get("/api/sellers", getSellers);
router.get("/api/chat-existence/:adId", determineChatExistence);
router.get("/api/chat/:id", getChat);
router.post("/api/chat", postChat);
router.post("/ad", upload.array("imagesInput", 4), postAd);
router.put("/api/account-image", upload.single("imageInput"), addAccountImage);
router.post("/api/log-in", logIn);
router.post("/api/sign-up", signUp);
router.get("/api/ads/:userId", getMyAds);
router.get("/api/ads-briefly", getAdsBriefly);

router.put("/api/ad/:creationDate", finishAd);
router.put("/api/images", upload.array("imagesInput", 4), addImages);
router.put("/api/images/:id", deleteImage);
router.put("/api/chat", addMessages);

router.delete("/api/ad/:creationDate", deleteAd);
router.delete("/api/unsaved_ad/:creationDate", deleteUnsavedAd);
router.delete("/api/chat/:id", deleteChat)

router.get("/api/verify-email", verifyEmail);

module.exports = router;