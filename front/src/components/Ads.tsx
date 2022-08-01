import { useState, useEffect, FC } from 'react';
import Menu from "./Menu";
import { getAds } from "../functions/functions";
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Card,
  CardActions,
  CardMedia,
  Skeleton,
  CardContent,
  CircularProgress,
  Typography,
  TextField,
  InputAdornment,
  CardActionArea,
  Backdrop,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { SearchOff } from '@mui/icons-material';
import { AdType, GetAdsPropsType } from '../types';

const Ads: FC = () => {
  const [ads, setAds] = useState<Array<AdType>>([]);
  const [sortingParams, setSortingParams] = useState<Array<string>>([]);
  const [pageCount, setPageCount] = useState(0);
  const [adsLoading, setAdsLoading] = useState(false);
  const PER_PAGE = 3;
  const [page, setPage] = useState(1);
  const [subString, setSubString] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const navigate = useNavigate();
  const renderParticularAd = (id: string): void => navigate(`/ad/${id}`);
  // const { user } = useContext(UserContext);

  const getAdsProps: GetAdsPropsType = {
    functionProps: {
      page,
      PER_PAGE,
      sortingParams,
      subString,
      category,
      subCategory,
    },
    setAds,
    setPageCount,
    setPage,
    setAdsLoading,
  };

  const changePage = (page: number): void => {
    setPage(page);
    getAds(getAdsProps);
  };

  useEffect(() => {
    console.log("changed!!!!!!")
    const defaultPage = 1;
    setPage(defaultPage);
    getAds({ ...getAdsProps, functionProps: { ...getAdsProps.functionProps, page: defaultPage } });
  }, [sortingParams, subString, category, subCategory]);

  const sortingOptions = [
    { value: "price_asc", label: "Price: lowest first" },
    { value: "price_desc", label: "Price: highest first" },
    { value: "creationDate_desc", label: "Date: newest first" },
    { value: "creationDate_asc", label: "Date: oldest first" },
  ];
console.log("category:", category, "subcategory:", subCategory, "substring: ", subString);
  return (
    <div className="ads_container">
      <Menu
        getAdsProps={getAdsProps}
        setSubString={setSubString}
        setCategory={setCategory}
        setSubCategory={setSubCategory}
      />
      <div className="main">
        <div className="sorting_and_search">
          <FormControl
            className="sorting"
            size="small"
            style={{ margin: "10px" }}
          >
            <InputLabel id="sorting-select">
              Sorting
            </InputLabel>
            <Select
              labelId="sorting-select"
              id="demo-simple-select"
              label="Sorting"
              // value={age}
              defaultValue={"creationDate_desc"}
              onChange={e => {
                setSortingParams(e.target.value.split("_"));
                setPage(1);
              }}
            >
              {sortingOptions.map(e => (
                <MenuItem
                  key={e.value}
                  value={e.value}
                >
                  {e.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            id="input-with-icon-textfield"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            placeholder="Search..."
            variant="standard"
            onChange={e => setSubString(e.target.value)}
            value={subString}
            onKeyDown={e => e.code === "Enter" && getAds(getAdsProps)}
            autoComplete="off"
            className="search"
          />
        </div>
        <div className="ads">
          {adsLoading ?
            function () {
              let content = [];
              for (let i = 0; i < 3; i++) {
                content.push(
                  <Skeleton
                    variant="rectangular"
                    className="skeleton"
                  />
                );
              };
              return content;
            }() :
            ads.map(el => (
              <Card className="card">
                <CardActionArea
                  className="card_action_area"
                  onClick={() => renderParticularAd(el._id)}
                >
                  <CardMedia
                    component="img"
                    alt="1"
                    // height="140"
                    image={`data:image/png;base64,${el.images.length && el.images[0].data}`}
                  />
                </CardActionArea>
                <CardContent className="card_content">
                  <>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      onClick={() => renderParticularAd(el._id)}
                      className="product_title"
                    >
                      {el.textInfo.title}
                    </Typography>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                    >
                      USD {el.textInfo.price}
                    </Typography>
                  </>
                  <Typography variant="body2">
                    {el.textInfo.category}, {el.textInfo.subCategory}
                    <br />
                    By {el.textInfo.name} from {el.textInfo.region}, {el.textInfo.city}
                  </Typography>
                </CardContent>
                <CardActions className="card_actions">
                  {/* <Button size="small">Share</Button> */}
                  <Button size="large">
                    Learn more...
                  </Button>
                </CardActions>
              </Card>
            ))
          }
          {!ads.length &&
            <div className="plug">
              <SearchOff fontSize="large" />
              <Typography variant="body1">
                Nothing was found. Try to change the Search Criteria.
              </Typography>
            </div>
          }
        </div>
        {pageCount > 1 &&
          <Pagination
            count={pageCount}
            defaultPage={1}
            variant="outlined"
            color="primary"
            size="large"
            onChange={(_, page) => changePage(page)}
            page = {page}
          />
        }
      </div>
    </div>
  );
};

export default Ads;