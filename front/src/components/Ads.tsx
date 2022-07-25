import { useState, useEffect, FC } from 'react';
import Header from './Header';
import Menu from "./Menu";
import { getAds } from "../functions/functions";

import {
  Button,
  Card,
  CardActions,
  CardMedia,
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
  const [loading, setLoading] = useState(false);
  const PER_PAGE = 2;
  const [page, setPage] = useState(1);
  const [subString, setSubString] = useState("");
  const [category, setCategory] = useState("");
  // const { user } = useContext(UserContext);

  const getAdsProps: GetAdsPropsType = {
    page,
    PER_PAGE,
    sortingParams,
    subString,
    setAds,
    setPageCount,
    setPage,
    setLoading,
  };

  useEffect(() => {
    !category && getAds(getAdsProps);
  }, [page, sortingParams]);

  const sortingOptions = [
    { value: "price_asc", label: "Price: lowest first" },
    { value: "price_desc", label: "Price: highest first" },
    { value: "creationDate_desc", label: "Date: newest first" },
    { value: "creationDate_asc", label: "Date: oldest first" },
  ];

  return (
    <div>
      <Header />
      <div className="main-page_container">
        <Menu
          getAdsProps={getAdsProps}
          subString={subString}
          setSubString={setSubString}
          category={category}
          setCategory={setCategory}
          page={page}
        />
        <div className="main">
          <div className="search_and_sort">
            <FormControl className="sorting" size="small" style={{ margin: "10px" }}>
              <InputLabel id="sorting-select">
                Sorting
              </InputLabel>
              <Select
                labelId="sorting-select"
                id="demo-simple-select"
                label="Sorting"
                // value={age}
                defaultValue={"creationDate_desc"}
                onChange={e => setSortingParams(e.target.value.split("_"))}
              >
                {sortingOptions.map(e => (
                  <MenuItem key={e.value} value={e.value}>
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
            />
          </div>
          <div className="ads">
            <Backdrop className="loading_backdrop" open={loading}>
              <CircularProgress className="loading" />
            </Backdrop>
            {ads.map(el => (
              <Card className="card">
                <CardActionArea className="card_media">
                  <CardMedia
                    component="img"
                    alt="1"
                    // height="140"
                    image={`data:image/png;base64,${el.images.length && el.images[0].data}`}
                  />
                </CardActionArea>
                <CardContent className="card_content">
                  <div>
                    <Typography gutterBottom variant="h5" component="div">
                      {el.textInfo.title}
                    </Typography>
                    <Typography gutterBottom variant="h6" component="div">
                      USD {el.textInfo.price}
                    </Typography>
                  </div>
                  <Typography variant="body2">
                    {el.textInfo.category}, {el.textInfo.subCategory}
                    <br />
                    By {el.textInfo.name} from {el.textInfo.region}, {el.textInfo.city}
                  </Typography>
                </CardContent>
                <CardActions className="card_actions">
                  {/* <Button size="small">Share</Button> */}
                  <Button size="large">Learn More</Button>
                </CardActions>
              </Card>
            ))}
          </div>
          {pageCount > 1 &&
            <Pagination
              count={pageCount}
              defaultPage={1}
              variant="outlined"
              color="primary"
              size="large"
              onChange={(_, page) => setPage(page)}
            />
          }
        </div>
        <div className="not_found">
          <Typography variant="body1">
            Nothing was found. Try to change the Search Criteria.
          </Typography>
          <SearchOff />
        </div>
      </div>
    </div>
  );
};

export default Ads;