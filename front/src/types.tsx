export interface AdType {
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
  setLoading: (loading: boolean) => void,
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
  name: string,
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

export type InterlocutorType = string | null;

export interface ChatType {
  creationDate: string,
  interlocutor: InterlocutorType,
  messages: Array<MessageType>,
};

export interface DataChatType {
  creationDate: string,
  messages: Array<MessageType>,
  participants: Array<string>,
  _id: string,
};

export interface UserContextInterface {
  user: UserType,
  setUser: (user: UserType) => void,
  logInDialog: { open: boolean },
  setLogInDialog: (logInDialog: { open: boolean }) => void,
  setTokenValidation: (tokenValidation: boolean) => void,
};

export type UserType = {
  id: string,
  email: string,
  name: string
} | null;