const fs = require("fs");
const Ad = require("../models/ad");
const Menu = require("../models/menu");
const Region = require('../models/region');
const User = require("../models/user");
const Chat = require("../models/chat");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { json } = require("express");

const getMenu = (req, res) => {
  Menu
    .find()
    .then(menu => res.status(200).json(menu))
    .catch(error => console.error("Ops"));
};

const countAds = (req, res) => {
  const subString = req.query.subString;
  const category = req.query.category;
  const subCategory = req.query.subCategory;
  const countOptions = {};
  if (subString) {
    countOptions["textInfo.title"] = new RegExp(subString, "gi");
  };
  if (category) {
    countOptions["textInfo.category"] = category;
  };
  if (subCategory) {
    countOptions["textInfo.subCategory"] = subCategory;
  };

  Ad
    .count(countOptions)
    .then(number => res.status(200).json(number))
};

const getAds = (req, res) => {
  const page = +req.query.page;
  const perPage = +req.query.perPage;
  const order = req.query.order === "asc" ? 1 : -1;
  const field = req.query.field === "price" ? "textInfo.price" : "creationDate";
  const subString = req.query.subString;
  const subCategory = req.query.subCategory;
  const category = req.query.category;
  const sortingOptions = new Object();
  sortingOptions[field] = order;
  const regExp = new RegExp(subString, "gi");
  const searchOptions = () => {
    if (subString) {
      if (category) {
        return { "textInfo.title": regExp, "textInfo.category": category };
      } else if (subCategory) {
        return { "textInfo.title": regExp, "textInfo.subCategory": subCategory };
      } else {
        return { "textInfo.title": regExp };
      };
    } else if (!subString) {
      if (category) {
        return { "textInfo.category": category };
      } else if (subCategory) {
        return { "textInfo.subCategory": subCategory };
      } else {
        return {}
      };
    };
  };

  Ad
    .find(searchOptions(), { textInfo: true, images: { $elemMatch: { main: true } } })
    .limit(perPage).skip((page - 1) * perPage)
    .sort(sortingOptions).collation({ locale: "en_US", numericOrdering: true })
    .then(ads => res.status(200).json(ads))
};

const deleteAd = (req, res) => {
  Ad
    .findOneAndDelete({ creationDate: req.params.creationDate })
    .then(() => res.json("Ok"))
};

const postAd = (req, res) => {
  const ad = new Ad({
    images: req.files && req.files.map((el, i) => {
      return {
        id: `${el.filename}_${el.size}_${i}`,
        data: fs.readFileSync(el.path),
        contentType: "image/jpg"
      };
    }) || [],
    textInfo: req.body.ad || {},
    price: req.body.price || 0,
    creationDate: req.body.creationDate,
  });
  ad
    .save()
    .then(() => res.json("Ok"))
    .catch(error => console.error(error));
};

const addAccountImage = (req, res) => {
  User
    .updateOne({ _id: req.body.userId }, {
      $set: {
        image: {
          id: `${req.file.filename}_${req.file.size}`,
          data: fs.readFileSync(req.file.path),
          contentType: "image/jpg"
        }
      }
    })
    .then(() => res.json("Ok"))
    .catch(error => console.error(error));
};

const getAccountImage = (req, res) => {
  User
    .findOne({ _id: req.params.userId }, { "image.data": true })
    .then(image => res.json(image));
};

const deleteUnsavedAd = (req, res) => {
  Ad
    .findOneAndDelete({ creationDate: req.params.creationDate, textInfo: {} })
    .then(() => res.json("Ok"))
};

const addImages = (req, res) => {
  Ad
    .updateOne({ creationDate: req.body.creationDate }, {
      $push: {
        images: {
          $each: req.files.map((el, i) => {
            return {
              id: `${el.filename}_${el.size}_${i}`,
              data: fs.readFileSync(el.path),
              contentType: "image/jpg"
            };
          }),
        }
      }
    })
    .then(() => res.json("Ok"))
    .catch(error => console.error(error));
};

const getImages = (req, res) => {
  Ad
    .find({ creationDate: req.params.creationDate }, { images: true })
    .then(images => res.status(200).json(images))
    .catch(error => console.error("Ops"));
};

const getRegions = (req, res) => {
  Region
    .find()
    .then(regions => res.status(200).json(regions))
};

const deleteImage = (req, res) => {
  Ad
    .updateOne({ creationDate: req.body.creationDate }, {
      $pull: {
        images: {
          id: req.params.id
        }
      }
    })
    .then(() => res.json("Ok"))
    .catch(error => console.error(error));
};

const finishAd = (req, res) => {
  Ad
    .updateOne({
      creationDate: req.params.creationDate
    }, {
      $set: {
        textInfo: req.body.ad,
      }
    })
    .then(() =>
      Ad.updateOne({
        creationDate: req.params.creationDate,
        "images.id": req.body.mainPictureId,
      }, {
        $set: {
          "images.$.main": true
        }
      })
    )
    .then(() => res.json("Ok"))
    .catch(error => console.error(error));
};

const signUp = (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({
    name,
    email,
    password,
    emailToken: crypto.randomBytes(64).toString("hex"),
    isVerified: false,
  })
  bcrypt
    .genSalt(10)
    .then(salt => {
      return bcrypt.hash(user.password, salt);
    })
    .then(hash => {
      user.password = hash
    })
    .then(() => {
      return user.save()
    })
    .then(() => res.json("Ok"))
    .catch(error => {
      error.name === "MongoServerError" ?
        res.status(422).send("The Email is already registered.") :
        console.error(error)
    });

  const transporter = nodemailer.createTransport({
    // service: "gmail",
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
      user: "antonhpl@mail.ru",
      pass: "3AuUMoTLYuR7Gwjv9SHQ",
    },
    // tls: {
    //   rejectUnauthorized: false,
    // }
  });

  const mailOptions = {
    from: "Flea Market <antonhpl@mail.ru>",
    to: user.email,
    subject: "Please verify your email address on Flea Market.",
    html: `
      <h4>Dear ${user.name}!</h4>
      <p>Thank you for joining Flea Market team!</p>
      <p>Please cerify your email address by clicking the link below:</p>
      <a href = "http://localhost:3001/api/verify-email?token=${user.emailToken}">Verify the Email</a>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    error ? console.error(error) :
      console.log(`Verification email was sent to ${user.email}`)
  })
};

const verifyEmail = (req, res) => {
  const token = req.query.token;
  User
    .findOne({ emailToken: token })
    .then(user => {
      user.emailToken = null;
      user.isVerified = true;
      return user.save();
    })
    .then(() => res.json("Ok"))
    .catch(error => console.error(error))
};

const logIn = (req, res) => {
  const { email, password, cookieAge } = req.body;
  const throwError = (res) => res.status(500).send({ message: "The credentials are incorrect. Please try again." });
  let userFound;
  User
    .findOne({ email: email })
    .then(user => {
      userFound = user;
      return bcrypt.compare(password, user.password);
    })
    .then(passwordValidation => {
      if (passwordValidation) {
        const token = jwt.sign({ userId: userFound.id }, process.env.JWT_SECRET);
        // console.log("token:", token);
        res.cookie("access-token", token, { maxAge: cookieAge });
        res.json(true);
      } else {
        throwError(res);
      }
    })
    .catch(() => throwError(res));
};

const validateToken = (req, res, next) => {
  const token = req.cookies["access-token"];
  if (token) {
    const validToken = jwt.verify(token, process.env.JWT_SECRET)
    if (validToken) {
      console.log("validToken", validToken);
      res.user = validToken.id;
      res.json({ user: { id: validToken.userId } });
    } else {
      console.log("TOKEN EXPIRES")
      res.json(false);
    };
  } else {
    console.log("TOKEN NOT FOUND")
    res.json(false)
  }
};

const logOut = (req, res) => {
  res.cookie("access-token", "", { maxAge: 3600 * 1000 });
  res.json(true);
};

const postChat = (req, res) => {
  const chat = new Chat({
    participants: req.body.participants,
    messages: req.body.messages,
    creationDate: req.body.creationDate,
    adId: req.body.adId,
  });
  chat
    .save()
    .then(() => res.json("OK"))
    .catch(error => console.error(error));
};

const getUser = (req, res) => {
  User
    .find({ _id: req.params.id }, { name: true, registrationDate: true, email: true, "image.data": true })
    .then(user => res.json(user))
    .catch(error => console.error(error));
};

const getChats = (req, res) => {
  Chat
    .find({ "participants.id": req.params.userId })
    .then(chats => res.json(chats))
    .catch(error => console.error(error));
};

const addMessages = (req, res) => {
  Chat
    .updateOne({ _id: req.body.id }, {
      $push: {
        messages: {
          $each: req.body.messages,
        },
      },
    })
    .then(() => res.json("Ok"))
    .catch(error => console.error(error));
};

const getAd = (req, res) => {
  Ad
    .findOne({ _id: req.params.id })
    .then(ad => res.json(ad))
};

const getAdsBriefly = (req, res) => {
  Ad
    .find(
      { _id: { $in: JSON.parse(req.query.adsIds) } },
      {
        images: { $elemMatch: { main: true } },
        "textInfo.title": true
      }
    )
    .then(ads => res.json(ads))
};

const getSellers = (req, res) => {
  User
    .find(
      { _id: { $in: JSON.parse(req.query.sellersIds) } },
      { "image.data": true, name: true }
    )
    .then(sellers => res.json(sellers));
};

const getSeller = (req, res) => {
  User
    .find({ _id: req.params.id }, { "image.data": true, name: true, registrationDate: true })
    .then(seller => res.json(seller));
};

const determineChatExistence = (req, res) => {
  Chat
    .findOne({ adId: req.params.adId })
    .then(chat => res.json(chat ? true : false))
};

module.exports = {
  getAds,
  countAds,
  getImages,
  getMenu,
  getRegions,
  validateToken,
  verifyEmail,
  logOut,
  postAd,
  addAccountImage,
  logIn,
  signUp,
  finishAd,
  addImages,
  deleteImage,
  deleteAd,
  deleteUnsavedAd,
  postChat,
  getUser,
  getChats,
  addMessages,
  getAccountImage,
  getAd,
  getSeller,
  getAdsBriefly,
  getSellers,
  determineChatExistence,
};