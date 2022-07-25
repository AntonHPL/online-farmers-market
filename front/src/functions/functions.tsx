import axios from "axios";
import { GetAdsPropsType } from "../types";

export const getAds = ({ page, PER_PAGE, sortingParams, subString, setAds, setPageCount, setPage, setLoading, category = "" }: GetAdsPropsType) => {
  setLoading(true);
  axios
    .get("/api/ads/", {
      params: {
        page: page,
        perPage: PER_PAGE,
        field: sortingParams[0],
        order: sortingParams[1],
        subString: subString,
        category: category,
      }
    })
    .then(({ data }) => {
      setAds(data);
      axios.get("/api/count_ads", {
        params: {
          subString: subString,
          category: category
        }
      })
        .then(({ data }) => {
          setPageCount(Math.ceil(data / PER_PAGE));
          // setPage(1);
          setLoading(false);
        });
    })
};