import axios from "axios";
import { GetAdsPropsType } from "../types";

export const getAds = ({
  functionProps: {
    page,
    PER_PAGE,
    sortingParams,
    subString,
    category = "",
    subCategory = "",
  },
  setAds,
  setPageCount,
  setPage,
  setAdsLoading
}: GetAdsPropsType) => {
  console.log("info", page, PER_PAGE, sortingParams[0], sortingParams[1], subString, category, subCategory)
  setAdsLoading(true);
  axios
    .get("/api/ads/", {
      params: {
        page,
        perPage: PER_PAGE,
        field: sortingParams[0] || undefined,
        order: sortingParams[1] || undefined,
        subString: subString || undefined,
        category: category || undefined,
        subCategory: subCategory || undefined,
      }
    })
    .then(({ data }) => {
      setAds(data);
      axios.get("/api/count_ads", {
        params: {
          subString: subString || undefined,
          category: category || undefined,
        }
      })
        .then(({ data }) => {
          setPageCount(Math.ceil(data / PER_PAGE));
          // setPage(1);
          setAdsLoading(false);
        });
    })
};