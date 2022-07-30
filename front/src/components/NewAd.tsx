import axios from 'axios';
import { useEffect, useState, useContext, DragEvent, FormEvent } from 'react';
import { UserContext } from "./UserContext";
import { styled } from '@mui/material/styles';
// import SaveIcon from '@mui/icons-material/Save';
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
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Dialog,
    Slide
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from "@mui/icons-material/Delete"
// import { useNavigate } from 'react-router-dom';
import { CategoryType, EmptyAdType, ImageType, RegionType, DataCategoryType, DataRegionType } from '../types';

const NewAd = () => {
    const { user } = useContext(UserContext);
    const emptyAd: EmptyAdType = {
        title: "",
        category: "",
        subCategory: "",
        description: "",
        region: "",
        price: 0,
        city: "",
        sellerName: user?.name || "",
        sellerEmail: user?.email || "",
        sellerId: user?._id || "",
    };

    
    const [imagesToUpload, setImagesToUpload] = useState<FileList | null>(null);
    const [images, setImages] = useState<Array<ImageType>>([]);
    const [ad, setAd] = useState<EmptyAdType>(emptyAd);
    const [categories, setCategories] = useState<Array<CategoryType>>([]);
    const [regions, setRegions] = useState<Array<RegionType>>([]);
    const [creationDate, setCreationDate] = useState(new Date().toISOString());
    const [priceInputDisabled, setPriceInputDisabled] = useState(false);
    const [adUploading, setAdUploading] = useState(false);
    const [imagesUploaded, setImagesUploaded] = useState(0);
    const [adIsCreated, setAdIsCreated] = useState(false);
    const [mainPictureId, setMainPictureId] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [imagesBeingUploaded, setImagesBeingUploaded] = useState(0);
    const [imageBeingRemoved, setImageBeingRemoved] = useState("");
    const [deleteIcon, setDeleteIcon] = useState("");

    // const navigate = useNavigate();

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    useEffect(() => {
        openDialog && setAd(emptyAd);
    }, [openDialog]);

    const text =
        <div>
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
        </div>;

    const setDefaultMainPictureId = () => {
        images.length && setMainPictureId(images[0].id)
    }

    useEffect(() => {
        !mainPictureId && setDefaultMainPictureId();
    }, [images]);

    useEffect(() => {
        // const fd = new FormData();
        // fd.append("imagesInput", []);
        // fd.append("ad", JSON.stringify(ad));
        // fd.append("creationDate", new Date().toISOString());
        axios
            .get("/api/menu")
            .then(({ data }) => {
                setCategories(data.map((e: DataCategoryType): CategoryType => {
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
                setRegions(data.map((e: DataRegionType): RegionType => {
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
        return (): void => {
            axios.delete(`/api/unsaved_ad/${creationDate}`)
        }
    }, []);

    useEffect(() => {
        setAd({ ...ad, subCategory: null });
    }, [ad.category]);
    window.onbeforeunload = function () {
        axios.delete(`/api/unsaved_ad/${creationDate}`);
        return undefined;
    }
    useEffect(() => {
        if (imagesToUpload) {
            const fd = new FormData();
            fd.append("creationDate", creationDate);
            if (imagesToUpload.length + imagesUploaded < 4) {
                for (let i = 0; i < imagesToUpload.length; i++) {
                    fd.append("imagesInput", imagesToUpload[i]);
                };
                setImagesBeingUploaded(imagesToUpload.length);
            } else {
                for (let i = 0; i < 4 - imagesUploaded; i++) {
                    fd.append("imagesInput", imagesToUpload[i]);
                };
                setImagesBeingUploaded(4 - imagesUploaded);
            };
            if (adIsCreated) {
                axios.put("/api/images", fd)
                    .then(() => {
                        setImagesUploaded(prev => prev + imagesToUpload.length);
                        getImages();
                    })
            } else {
                axios
                    .post("/ad", fd)
                    .then(() => {
                        setImagesUploaded(prev => prev + imagesToUpload.length);
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
        saveAndPlace();
    };

    const getImages = () => {
        axios
            .get(`/api/images/${creationDate}`)
            .then(({ data }) => {
                setImages(data[0].images);
                setImagesBeingUploaded(0);
                setImageBeingRemoved("");
            })
            .catch(error => {
                console.log(error);
                setImagesBeingUploaded(0);
                setImageBeingRemoved("");
            })
    };

    console.log("imagesbeing", imagesBeingUploaded);

    const deleteImage = (id: string): void => {
        setImageBeingRemoved(id);
        if (imagesUploaded === 1) {
            axios.delete(`/api/ad/${creationDate}`)
                .then(() => {
                    setImagesUploaded(prev => prev - 1);
                    setImages([]);
                    setImageBeingRemoved("");
                    setAdIsCreated(false);
                    id === mainPictureId && setMainPictureId("");
                })
        } else {
            axios
                .put(`/api/images/${id}`, { creationDate: creationDate })
                .then(() => {
                    setImagesUploaded(prev => prev - 1);
                    getImages();
                    id === mainPictureId && setMainPictureId("");
                })
        }

    }

    const onDrop = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        setImagesToUpload(e.dataTransfer.files);
    };

    const closeDialog = (): void => setOpenDialog(false);

    const onDragOver = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
    };

    const saveAndPlace = (): void => {
        setAdUploading(true);
        if (adIsCreated) {
            axios
                .put(`/api/ad/${creationDate}`, { ad, mainPictureId })
                .then(() => {
                    setAdUploading(false);
                    setOpenDialog(true);
                })
                .catch(error => {
                    console.log("The error occured:", error);
                    setAdUploading(false)
                })
        } else {
            axios.post("/ad", { creationDate, ad })
                .then(() => {
                    setAdUploading(false);
                    setOpenDialog(true);
                })
                .catch(error => {
                    console.log("The error occured:", error);
                    setAdUploading(false)
                })
        }

    };

    return (
        <div className="newAd_container">

            <Typography variant="h4">
                Create a new Ad
            </Typography>
            <Typography variant="h5">
                Photos
            </Typography>
            <Card
                onDragOver={onDragOver}
                onDrop={onDrop}
                className="images_card"
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
                    <Typography variant="body2" color="text.secondary">
                        ...or drop them here.
                    </Typography>
                </CardContent>
                <div className="images">
                    {images.length > 0 && images.map((e, i) => {
                        return (
                            <Tooltip title="Click to make the picture the main one.">
                                <Card
                                    className={`${mainPictureId === e.id ? "main-" : ""}image_card`}
                                    onMouseOver={() => !imageBeingRemoved && setDeleteIcon(e.id)}
                                    onMouseLeave={() => setDeleteIcon("")}
                                >
                                    <IconButton
                                        aria-label="delete"
                                        className={`deleteButton${deleteIcon === e.id ? "" : "_invisible"}`}
                                        onClick={() => deleteImage(e.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <Backdrop open={imageBeingRemoved === e.id} className="deleting_backdrop" >
                                        <CircularProgress className="deleting" />
                                    </Backdrop>
                                    <CardActionArea onClick={() =>
                                        setMainPictureId(e.id)
                                    }>
                                        <CardMedia
                                            className="image"
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
                                <Card key={i} className={i === 0 && !imagesUploaded ? "first_loading_card" : "loading_card"}>
                                    <CircularProgress />
                                </Card>
                            );
                        };
                        return content;
                    }()}
                </div>
            </Card>
            <form
                onSubmit={onSubmit}
                encType="multipart/form-data"
            >
                <Typography variant="h5">
                    General Info
                </Typography>
                <TextField
                    required
                    label="Product Title"
                    variant="outlined"
                    placeholder="E. g. Lenovo ThinkPad"
                    helperText="Please enter the Product Title."
                    onChange={e => setAd({ ...ad, title: e.target.value })}
                    className="form_row"
                />
                <div className="form_row">
                    <FormControl
                        // required
                        sx={{ m: 1, minWidth: 120 }}
                        className={ad.category ? "half-width_field" : "full-width_field"}
                    >
                        <InputLabel id="categories-select">
                            Category
                        </InputLabel>
                        <Select
                            labelId="categories-select"
                            label="Category"
                            value={ad.category}
                            onChange={e => setAd({ ...ad, category: e.target.value })}
                            MenuProps={MenuProps}
                        >
                            {categories.map(e => (
                                <MenuItem key={e.value} value={e.value}>
                                    {e.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                            Please choose the Category.
                        </FormHelperText>
                    </FormControl>
                    {ad.category &&
                        <FormControl
                            // required
                            className="half-width_field"
                        >
                            <InputLabel id="subCategories-select">
                                SubCategory
                            </InputLabel>
                            <Select
                                labelId="subCategories-select"
                                label="SubCategory"
                                value={ad.subCategory}
                                onChange={e => setAd({ ...ad, subCategory: e.target.value })}
                                MenuProps={MenuProps}
                            >
                                {categories
                                    .find(e => e.value === ad.category)?.subCategories
                                    .map(e => {
                                        return (
                                            <MenuItem key={e.value} value={e.value}>
                                                {e.label}
                                            </MenuItem>
                                        )
                                    })
                                }
                            </Select>
                            <FormHelperText>
                                Please choose the City.
                            </FormHelperText>
                        </FormControl>
                    }
                </div>
                <TextField
                    // required
                    multiline
                    rows={4}
                    label="Description"
                    value={ad.description}
                    onChange={e => setAd({ ...ad, description: e.target.value })}
                    helperText="Please enter the Description."
                    className="form_row"
                />
                <div className="price_block">
                    <TextField
                        // required
                        label="Price"
                        type="number"
                        helperText="Please enter the Price."
                        disabled={priceInputDisabled}
                        onChange={e => setAd({ ...ad, price: +e.target.value })}
                        className="price_field"
                    />
                    <FormControlLabel
                        control={<Switch />}
                        onChange={() => {
                            setPriceInputDisabled(!priceInputDisabled);
                            setAd({ ...ad, price: 0 })
                        }}
                        label="For free"
                        className="price_label" />
                </div>
                <Typography variant="h5">
                    Product's Location
                </Typography>
                <div className="form_row">
                    <FormControl
                        // required
                        className={ad.region ? "half-width_field" : "full-width_field"}
                    >
                        <InputLabel id="regions-select">
                            Region
                        </InputLabel>
                        <Select
                            labelId="regions-select"
                            label="Region"
                            value={ad.region}
                            onChange={e => setAd({ ...ad, region: e.target.value })}
                            MenuProps={MenuProps}
                        >
                            {regions.map(e => (
                                <MenuItem key={e.value} value={e.value}>
                                    {e.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                            Please choose the Region.
                        </FormHelperText>
                    </FormControl>
                    {ad.region &&
                        <FormControl
                            // required
                            className="half-width_field"
                        >
                            <InputLabel id="cities-select">
                                City
                            </InputLabel>
                            <Select
                                labelId="cities-select"
                                label="City"
                                value={ad.city}
                                onChange={e => setAd({ ...ad, city: e.target.value })}
                                MenuProps={MenuProps}

                            >
                                {regions
                                    .find(e => e.value === ad.region)?.cities
                                    .map(e => {
                                        return (
                                            <MenuItem key={e.value} value={e.value}>
                                                {e.label}
                                            </MenuItem>
                                        )
                                    })
                                }
                            </Select>
                            <FormHelperText>
                                Please choose the City.
                            </FormHelperText>
                        </FormControl>
                    }
                </div>
                <Typography variant="h5">
                    Seller's Contacts
                </Typography>
                <TextField
                    // required
                    label="Name"
                    variant="outlined"
                    value={ad.sellerName}
                    placeholder="E. g. John Doe"
                    disabled
                    className="form_row"
                />
                <TextField
                    type={"email"}
                    // required
                    label="Email"
                    variant="outlined"
                    value = {ad.sellerEmail}
                    placeholder="E. g. John Doe"
                    disabled
                    className="form_row"
                />
                <Button
                    type="submit"
                    onClick={saveAndPlace}
                    startIcon={<SaveIcon />}
                    variant="contained"
                    className="submitButton"
                >
                    Save & place
                </Button>
            </form>
            <Card className="info_card">
                <CardActions>
                    Attention!
                </CardActions>
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        {text}
                    </Typography>
                </CardContent>
            </Card>
            <Dialog
                open={openDialog}
                keepMounted
                onClose={closeDialog}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>Congratulations!</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        Your Ad was successfully created!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>OK</Button>
                </DialogActions>
            </Dialog>
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