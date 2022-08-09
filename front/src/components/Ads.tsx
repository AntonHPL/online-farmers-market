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
  Typography,
  TextField,
  InputAdornment,
  CardActionArea,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { SearchOff, NoPhotography } from '@mui/icons-material';
import { AdInterface, GetAdsPropsInterface, SortingOptionInterface } from '../types';

const Ads: FC = () => {
  const [ads, setAds] = useState<Array<AdInterface> | null>(null);
  const [sortingParams, setSortingParams] = useState<Array<string> | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [adsLoading, setAdsLoading] = useState(false);
  const PER_PAGE = 3;
  const [page, setPage] = useState<number | undefined>(undefined);
  const [subString, setSubString] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [adsAmount, setAdsAmount] = useState(0);
  const navigate = useNavigate();
  const renderParticularAd = (id: string): void => navigate(`/ad/${id}`);
  const defaultPage = 1;
  let getAdsProps: GetAdsPropsInterface = {
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
    setAdsAmount,
    setAdsLoading,
  };

  const changePage = (page: number): void => {
    setPage(page);
  };

  useEffect(() => {
    page && getAds(getAdsProps);
  }, [page]);

  useEffect(() => {
    page !== defaultPage && setPage(defaultPage);
    getAdsProps = { ...getAdsProps, functionProps: { ...getAdsProps.functionProps, page: defaultPage } };
    page === defaultPage && getAds(getAdsProps);
  }, [sortingParams, category, subCategory]);

  const sortingOptions: Array<SortingOptionInterface> = [
    { value: "price_asc", label: "Price: lowest first" },
    { value: "price_desc", label: "Price: highest first" },
    { value: "creationDate_desc", label: "Date: newest first" },
    { value: "creationDate_asc", label: "Date: oldest first" },
  ];

  return (
    <div className="ads-container">
      <Menu
        getAdsProps={getAdsProps}
        setSubString={setSubString}
        setCategory={setCategory}
        setSubCategory={setSubCategory}
      />
      <div className="main">
        <div className="sorting-and-search">
          <FormControl
            className="sorting"
            size="small"
          >
            <InputLabel id="sorting-select">
              Sorting
            </InputLabel>
            <Select
              labelId="sorting-select"
              id="demo-simple-select"
              label="Sorting"
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
            className={`search${ads ? "-compressed" : ""}`}
          />
          {ads &&
            <div className="ads-amount">
              {adsAmount} {adsAmount === 1 ? "ad" : "ads"} found
            </div>
          }
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
            ads?.map(el => (
              <Card className="card">
                <CardActionArea
                  className="card-action-area"
                  onClick={() => renderParticularAd(el._id)}
                >
                  {el.images.length && el.images[0].data ?
                    <CardMedia
                      component="img"
                      alt="1"
                      // height="140"
                      image={`data:image/png;base64,${el.images[0].data}`}
                    /> :
                    <NoPhotography />
                  }
                </CardActionArea>
                <CardContent className="card-content">
                  <>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      onClick={() => renderParticularAd(el._id)}
                      className="product-title"
                    >
                      {el.textInfo.title}
                    </Typography>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                    >
                      {el.textInfo.price ? `$${el.textInfo.price}` : "For free"}
                    </Typography>
                  </>
                  <Typography variant="body2">
                    {el.textInfo.category}, {el.textInfo.subCategory}
                    <br />
                    By {el.textInfo.sellerName} from {el.textInfo.region}, {el.textInfo.city}
                  </Typography>
                </CardContent>
                <CardActions className="card-actions">
                  {/* <Button size="small">Share</Button> */}
                  <Button size="large">
                    Learn more...
                  </Button>
                </CardActions>
              </Card>
            ))
          }
          {!ads &&
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
            page={page}
            disabled={adsLoading}
          />
        }
      </div>
    </div>
  );
};

export default Ads;