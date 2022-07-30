export interface AdType {
  _id: string,
  images: Array<{ data: string }>,
  textInfo: {
    category: string,
    city: string,
    description: string,
    name: string,
    price: string,
    region: string,
    subCategory: string,
    title: string,
    sellerName: string,
    sellerEmail: string,
    sellerId: string,
  },
};

export interface GetAdsPropsType {
  page: number,
  PER_PAGE: number,
  sortingParams: Array<string>,
  subString: string,
  setAds: (ads: Array<AdType>) => void,
  setPageCount: (pageCount: number) => void,
  setPage: (page: number) => void,
  setAdsLoading: (loading: boolean) => void,
  category?: string,
};

export interface MenuPropsType {
  getAdsProps: GetAdsPropsType,
  subString: string,
  setSubString: (subString: string) => void,
  category: string,
  setCategory: (category: string) => void,
  page: number,
};

export interface EmptyAdType {
  title: string,
  category: string,
  subCategory: string | null,
  description: string,
  region: string,
  price: number,
  city: string,
  sellerName: string,
  sellerEmail: string,
  sellerId: string,
};

interface CityType {
  value: string,
  label: string,
};

export interface RegionType {
  cities: Array<CityType>,
  label: string,
  value: string,
};

interface SubCategoryType {
  label: string,
  value: string,
};

export interface CategoryType {
  label: string,
  subCategories: Array<SubCategoryType>,
  value: string,
};

export interface ImageType {
  contentType: string,
  data: string,
  id: string,
};

export interface DataCategoryType {
  contents: Array<string>,
  title: string,
  _id: string,
};

export interface DataRegionType {
  cities: Array<string>,
  state: string,
  _id: string,
};

export interface DataMenuType {
  contents: Array<string>,
  title: string,
  _id: string,
};

interface ContentsType {
  text: string,
  selected: boolean,
};

export interface MenuType {
  contents: Array<ContentsType>
  open: boolean,
  selected: boolean,
  title: string,
  _id: string,
};

export interface InputsType {
  name: string,
  email: string,
  password: string,
};

export interface EmptyInputsType {
  name: string,
  email: string,
  password: string,
};

export interface MessageType {
  senderId: string,
  message: string,
  break?: string,
  creationDate?: string,
};

export type InterlocutorType = { id: string, name: string } | null;

export interface ChatType {
  adId: string,
  creationDate: string,
  messages: Array<MessageType>,
  participants: Array<InterlocutorType>,
  _id: string,
};

export interface UserContextInterface {
  user: UserType,
  setUser: (user: UserType) => void,
  logInDialog: { open: boolean },
  setLogInDialog: (logInDialog: { open: boolean }) => void,
  setTokenValidation: (tokenValidation: boolean) => void,
  isAccountImageChanged: boolean,
  setIsAccountImageChanged: (isAccountImageChanged: boolean) => void,
};

export type UserType = {
  _id: string,
  email: string,
  name: string,
  image: { data: string },
} | null;

export interface BriefAdType {
  _id: string,
  images: Array<ImageType>,
  textInfo: { title: string },
}

export interface ModifiedChatType {
  _id: string,
  myInterlocutor: InterlocutorType,
  messages: Array<MessageType>,
  creationDate: string,
  adId: string,
  adImage?: string,
  adTitle?: string,
  sellerImage?: string,
};

export interface SellerType {
  _id: string,
  image: { data: string },
}