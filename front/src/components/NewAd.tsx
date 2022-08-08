import axios from 'axios';
import { useEffect, useState, useContext, FC, DragEvent, FormEvent } from 'react';
import { UserContext } from "./UserContext";
import { errorFound, resetErrors } from "../functions/functions";
import { styled } from '@mui/material/styles';
import {
  Button,
  Backdrop,
  CircularProgress,
  IconButton,
  TextField,
  MenuItem,
  FormControlLabel,
  Select,
  Switch,
  FormControl,
  InputLabel,
  FormHelperText,
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
  CardContent,
  Typography,
  Tooltip,
  Alert
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from "@mui/icons-material/Delete";
import SuccessDialog from './SuccessDialog';
import {
  CategoryInterface,
  EmptyAdInterface,
  ImageInterface,
  RegionInterface,
  DataCategoryInterface,
  DataRegionInterface,
  ErrorInterface,
} from '../types';

const NewAd: FC = () => {
  const { user } = useContext(UserContext);
  const emptyAd: EmptyAdInterface = {
    title: "",
    category: "",
    subCategory: "",
    description: "",
    region: "",
    price: "",
    city: "",
    sellerName: user?.name || "",
    sellerEmail: user?.email || "",
    sellerId: user?._id || "",
  };
  const [imagesToUpload, setImagesToUpload] = useState<FileList | null>(null);
  const [images, setImages] = useState<Array<ImageInterface> | null>(null);
  const [ad, setAd] = useState<EmptyAdInterface>(emptyAd);
  const [categories, setCategories] = useState<Array<CategoryInterface> | null>(null);
  const [regions, setRegions] = useState<Array<RegionInterface> | null>(null);
  const [creationDate, setCreationDate] = useState(new Date().toISOString());
  const [priceInputDisabled, setPriceInputDisabled] = useState(false);
  const [adUploading, setAdUploading] = useState(false);
  const [imagesUploaded, setImagesUploaded] = useState(0);
  const [adIsCreated, setAdIsCreated] = useState(false);
  const [mainPictureId, setMainPictureId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagesBeingUploaded, setImagesBeingUploaded] = useState(0);
  const [imageBeingRemoved, setImageBeingRemoved] = useState("");
  const [deleteIcon, setDeleteIcon] = useState("");
  const [imagesError, setImagesError] = useState(false);
  const [errors, setErrors] = useState<Array<ErrorInterface>>([]);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const IMAGES_LIMIT = 4;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const EF = (field: string): ErrorInterface | undefined => errorFound(errors, field);
  const RE = (field: string): void => resetErrors(errors, field, setErrors);

  useEffect(() => {
    isDialogOpen && setAd(emptyAd);
  }, [isDialogOpen]);

  console.log(encodeURI(
    `<div>
      The ads posted on the Flea Market are to be written in English only and contain:
      <br />
      – the ad title and the specific product(s) description. The description is to be complete and reliable, should not contain the contact details of the seller and links to the third-party resources. It is not allowed to advertise dissimilar products in one ad. The ad title should not contain prices, links to the third-party resources and any contact information;
      <br />
      – the reliable price of the product(s). At the same time, it is to be indicated in USD in the “Price” field;
      <br />
      – the reliable information about the seller;
      <br />
      – the reliable information about the product(s) condition;
      <br />
      –  the reliable contact information that includes the e-mail. The e-mail is indicated in a special field while registering a profile. It is not allowed to indicate the e-mail in the ad text.
    </div>`
  )
  );

  const setDefaultMainPictureId = (): void => {
    images && setMainPictureId(images[0].id)
  }

  useEffect(() => {
    !mainPictureId && setDefaultMainPictureId();
  }, [images]);

  const deleteUnsavedAd = (): void => {
    axios.delete(`/api/unsaved_ad/${creationDate}`);
  };

  useEffect(() => {
    axios
      .get("/api/menu")
      .then(({ data }) => {
        setCategories(data.map((e: DataCategoryInterface): CategoryInterface => {
          return ({
            value: e.title,
            label: e.title,
            subCategories: e.contents.map(el => {
              return ({
                value: el,
                label: el,
              });
            }),
          });
        }));
      });
    axios
      .get("/api/regions")
      .then(({ data }) => {
        setRegions(data.map((e: DataRegionInterface): RegionInterface => {
          return ({
            value: e.state,
            label: e.state,
            cities: e.cities.map(el => {
              return ({
                value: el,
                label: el,
              });
            }),
          });
        }));
      });
    return deleteUnsavedAd;
  }, []);

  useEffect(() => {
    setAd({ ...ad, subCategory: null });
  }, [ad.category]);

  window.onbeforeunload = (): undefined => {
    deleteUnsavedAd();
    return undefined;
  };

  useEffect(() => {
    if (imagesToUpload) {
      const fd = new FormData();
      fd.append("creationDate", creationDate);
      const spaceLeft = IMAGES_LIMIT - imagesUploaded;
      const condition = imagesToUpload.length + imagesUploaded <= IMAGES_LIMIT;
      if (condition) {
        for (let i = 0; i < imagesToUpload.length; i++) {
          fd.append("imagesInput", imagesToUpload[i]);
        };
        setImagesBeingUploaded(imagesToUpload.length);
      } else {
        for (let i = 0; i < spaceLeft; i++) {
          fd.append("imagesInput", imagesToUpload[i]);
        };
        setImagesBeingUploaded(spaceLeft);
        setImagesError(true);
      };
      if (adIsCreated) {
        axios
          .put("/api/images", fd)
          .then(() => {
            setImagesUploaded(prev => condition ? prev + imagesToUpload.length : prev + spaceLeft);
            getImages();
          })
      } else {
        axios
          .post("/ad", fd)
          .then(() => {
            setImagesUploaded(prev => condition ? prev + imagesToUpload.length : prev + spaceLeft);
            setAdIsCreated(true);
            getImages();
          })
      }
    };
  }, [imagesToUpload]);

  const Input = styled('input')({
    display: 'none',
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const errorsData: Array<ErrorInterface> = [];
    let errorText: string;
    Object.entries(ad).map(([key, value]) => {
      const push = () => errorsData.push({ field: key, errorText: errorText });
      if (key === "price") {
        if (priceInputDisabled) return;
        if (value === "") {
          errorText = "The Price Field is empty.";
          push();
        } else if (value <= 0) {
          errorText = "The Minimum Price is 0.01 USD.";
          push();
        };
      };
      if (key !== "price" && !value) {
        switch (key) {
          case "title": errorText = "The Title Field is empty."; break;
          case "category": errorText = "The Category is not chosen."; break;
          case "subCategory": errorText = "The SubCategory is not chosen."; break;
          case "description": errorText = "The Description Field is empty."; break;
          case "region": errorText = "The Region is not chosen."; break;
          case "city": errorText = "The City is not chosen."; break;
        };
        push();
      };
    });
    setErrors(errorsData);
    if (!errorsData.length) {
      setAdUploading(true);
      if (adIsCreated) {
        axios
          .put(`/api/ad/${creationDate}`, { ad, mainPictureId })
          .then(() => {
            setAdUploading(false);
            setIsDialogOpen(true);
          })
          .catch(error => {
            console.error("The error occured:", error);
            setAdUploading(false)
          })
      } else {
        const currentTime = new Date().toISOString();
        axios
          .post("/ad", { creationDate: currentTime, ad })
          .then(() => {
            setAdUploading(false);
            setIsDialogOpen(true);
          })
          .catch(error => {
            console.error("The error occured:", error);
            setAdUploading(false);
          });
      };
      setCreationDate(new Date().toISOString());
    }
  };

  const getImages = (): void => {
    axios
      .get(`/api/images/${creationDate}`)
      .then(({ data }) => {
        setImages(data[0].images);
        setImagesBeingUploaded(0);
        setImageBeingRemoved("");
      })
      .catch(error => {
        console.error(error);
        setImagesBeingUploaded(0);
        setImageBeingRemoved("");
      })
  };

  const deleteImage = (id: string): void => {
    setImageBeingRemoved(id);
    if (imagesUploaded === 1) {
      axios
        .delete(`/api/ad/${creationDate}`)
        .then(() => {
          setImagesUploaded(prev => prev - 1);
          setImages(null);
          setImageBeingRemoved("");
          setAdIsCreated(false);
          id === mainPictureId && setMainPictureId("");
          setImagesError(false);
        })
    } else {
      axios
        .put(`/api/images/${id}`, { creationDate })
        .then(() => {
          setImagesUploaded(prev => prev - 1);
          getImages();
          setImagesError(false);
          id === mainPictureId && setMainPictureId("");
        });
    };
  };

  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setImagesToUpload(e.dataTransfer.files);
  };

  const closeDialog = (): void => setIsDialogOpen(false);

  const onDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  return (
    <div className="new-ad-container">
      <Typography variant="h4">
        Create a new Ad
      </Typography>
      <Typography variant="h5">
        Photos
      </Typography>
      <Card
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="card"
      >
        <CardActions>
          <label htmlFor="icon-button-file">
            <Input
              id="icon-button-file"
              accept="image/*"
              type="file"
              name="imagesInput"
              onChange={e => setImagesToUpload(e.target.files)}
              multiple
            />
            <Button
              disabled={imagesUploaded === 4}
              color="primary"
              aria-label="upload picture"
              component="span"
              startIcon={<PhotoCamera />}
              sx={{ textTransform: "none" }}
            >
              Click to add photos...
            </Button>
          </label>
        </CardActions>
        <CardContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            ...or drop them here.
          </Typography>
        </CardContent>
        <div className="images">
          {images?.map((e, i) => {
            return (
              <Tooltip title="Click to make the picture the main one.">
                <Card
                  className={`${mainPictureId === e.id ? "main-" : ""}image-card`}
                  onMouseOver={() => !imageBeingRemoved && setDeleteIcon(e.id)}
                  onMouseLeave={() => setDeleteIcon("")}
                >
                  <IconButton
                    aria-label="delete"
                    className={`${deleteIcon === e.id ? "" : "invisible-"}delete-button`}
                    onClick={() => deleteImage(e.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Backdrop
                    open={imageBeingRemoved === e.id}
                    className="backdrop"
                  >
                    <CircularProgress />
                  </Backdrop>
                  <CardActionArea onClick={() =>
                    setMainPictureId(e.id)
                  }>
                    <CardMedia
                      component="img"
                      image={`data:image/png;base64,${e.data}`}
                      id={e.id}
                      alt={String(i)}
                    />
                  </CardActionArea>
                </Card>
              </Tooltip>
            )
          })}
          {function () {
            let content = [];
            for (let i = 0; i < imagesBeingUploaded; i++) {
              content.push(
                <Card
                  key={i}
                  className={i === 0 && !imagesUploaded ? "first-loading-card" : "loading-card"}
                >
                  <CircularProgress />
                </Card>
              );
            };
            return content;
          }()}
        </div>
        {imagesError &&
          <Alert
            severity="error"
            className="alert"
          >
            You have tried to add too many (4+) pictures. That exceeds the limit.
          </Alert>
        }
      </Card>
      <form
        onSubmit={onSubmit}
        encType="multipart/form-data"
      >
        <Typography variant="h5">
          General Info
        </Typography>
        <TextField
          autoComplete="off"
          error={!!EF("title")}
          label="Product Title"
          variant="outlined"
          helperText={`${EF("title")?.errorText || ""} Example: Delicious Milk.`}
          onChange={e => {
            setAd({ ...ad, title: e.target.value });
            RE("title");
          }}
          className="form-row"
        />
        <div className="complex-form-row">
          <FormControl
            error={!!EF("category")}
            sx={{ m: 1, minWidth: 120 }}
            className={ad.category ? "half-width-field" : "full-width-field"}
          >
            <InputLabel id="categories-select">
              Category
            </InputLabel>
            <Select
              labelId="categories-select"
              label="Category"
              value={ad.category}
              onChange={e => {
                setAd({ ...ad, category: e.target.value });
                RE("category");
              }}
              MenuProps={MenuProps}
            >
              {categories?.map(e => (
                <MenuItem
                  key={e.value}
                  value={e.value}
                >
                  {e.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {EF("category")?.errorText || ""} Example: Dairy Products.
            </FormHelperText>
          </FormControl>
          {ad.category &&
            <FormControl
              error={!!EF("subCategory")}
              className="half-width-field"
            >
              <InputLabel id="subCategories-select">
                SubCategory
              </InputLabel>
              <Select
                labelId="subCategories-select"
                label="SubCategory"
                value={ad.subCategory}
                onChange={e => {
                  setAd({ ...ad, subCategory: e.target.value });
                  RE("subCategory");
                }}
                MenuProps={MenuProps}
              >
                {categories &&
                  categories
                    .find(e => e.value === ad.category)?.subCategories
                    .map(e => {
                      return (
                        <MenuItem
                          key={e.value}
                          value={e.value}
                        >
                          {e.label}
                        </MenuItem>
                      )
                    })
                }
              </Select>
              <FormHelperText>
                {EF("subCategory")?.errorText || ""} Example: Milk & Cream.
              </FormHelperText>
            </FormControl>
          }
        </div>
        <TextField
          autoComplete="off"
          error={!!EF("description")}
          multiline
          rows={4}
          label="Description"
          value={ad.description}
          onChange={e => {
            setAd({ ...ad, description: e.target.value });
            RE("description");
          }}
          helperText={`${EF("description")?.errorText || ""} Example: Fresh milk from old McDonald's farm.`}
          className="form-row"
        />
        <div className="price-block">
          <TextField
            inputProps={{ min: 0 }}
            autoComplete="off"
            error={priceInputDisabled ? false : !!EF("price")}
            label="Price (USD)"
            value={ad.price}
            type="number"
            helperText={`${EF("price")?.errorText || ""} Example: 10.`}
            disabled={priceInputDisabled}
            onChange={e => {
              setAd({ ...ad, price: +e.target.value });
              RE("price");
            }}
            className="price-field"
          />
          <FormControlLabel
            control={<Switch />}
            onChange={() => {
              setPriceInputDisabled(!priceInputDisabled);
              setAd({ ...ad, price: "" });
              RE("price");
            }}
            label="For free"
            className="price-label" />
        </div>
        <Typography variant="h5">
          Product's Location
        </Typography>
        <div className="complex-form-row">
          <FormControl
            error={!!EF("region")}
            className={ad.region ? "half-width-field" : "full-width-field"}
          >
            <InputLabel id="regions-select">
              Region
            </InputLabel>
            <Select
              labelId="regions-select"
              label="Region"
              value={ad.region}
              onChange={e => {
                setAd({ ...ad, region: e.target.value });
                RE("region");
              }}
              MenuProps={MenuProps}
            >
              {regions?.map(e => (
                <MenuItem key={e.value} value={e.value}>
                  {e.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {EF("region")?.errorText || ""} Example: Indiana.
            </FormHelperText>
          </FormControl>
          {ad.region &&
            <FormControl
              error={!!EF("city")}
              className="half-width-field"
            >
              <InputLabel id="cities-select">
                City
              </InputLabel>
              <Select
                labelId="cities-select"
                label="City"
                value={ad.city}
                onChange={e => {
                  setAd({ ...ad, city: e.target.value });
                  RE("city");
                }}
                MenuProps={MenuProps}
              >
                {regions &&
                  regions
                    .find(e => e.value === ad.region)?.cities
                    .map(e => {
                      return (
                        <MenuItem
                          key={e.value}
                          value={e.value}
                        >
                          {e.label}
                        </MenuItem>
                      )
                    })
                }
              </Select>
              <FormHelperText>
                {EF("city")?.errorText || ""} Example: Indianopolis.
              </FormHelperText>
            </FormControl>
          }
        </div>
        <Typography variant="h5">
          Seller's Contacts
        </Typography>
        <TextField
          type="text"
          label="Name"
          variant="outlined"
          value={ad.sellerName}
          disabled
          className="form-row"
        />
        <TextField
          type="email"
          label="Email"
          variant="outlined"
          value={ad.sellerEmail}
          disabled
          className="form-row"
        />
        <Button
          type="submit"
          startIcon={<SaveIcon />}
          variant="contained"
        >
          Save & place
        </Button>
      </form>
      {/* <Card className="info-card">
        <CardActions>
          Attention!
        </CardActions>
        <CardContent>
          <Typography
            variant="body1"
            color="text.secondary"
          >
            {text}
          </Typography>
        </CardContent>
      </Card> */}
      <SuccessDialog open={isDialogOpen} closeDialog={closeDialog} />
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={adUploading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default NewAd;