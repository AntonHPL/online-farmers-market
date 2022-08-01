import { useState, useEffect, FC } from "react";
import {
  ListSubheader,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import axios from "axios";
import { getAds } from "../functions/functions";
import { MenuPropsType, DataMenuType, MenuType } from '../types';

const Menu: FC<MenuPropsType> = ({ getAdsProps, setSubString, setCategory, setSubCategory }) => {
  const [stableItems, setStableItems] = useState<Array<MenuType>>([]);
  const [listItems, setListItems] = useState<Array<MenuType>>([]);
  const [menuLoading, setMenuLoading] = useState(false);

  const { subString, category } = getAdsProps.functionProps;

  useEffect(() => {
    setMenuLoading(true);
    axios.get("/api/menu")
      .then(({ data }) => {
        const items = data.map((e: DataMenuType): MenuType => {
          return {
            ...e,
            contents: e.contents.map(el => {
              return {
                text: el,
                selected: false,
              };
            }),
            open: false,
            selected: false,
          };
        });
        setListItems(items);
        setStableItems(items);
        setMenuLoading(false);
      });
  }, []);

  return (
    <div className="menu_container">
      {menuLoading ?
        <Skeleton
          variant="rectangular"
          className="skeleton"
        /> :
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "inherit" }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        // subheader={
        //   <ListSubheader component="div" id="nested-list-subheader">
        //     Nested List Items
        //   </ListSubheader>
        // }
        >
          {listItems.map(li => {
            return (
              <>
                <ListItemButton
                  onClick={clickedItem => {
                    const target = clickedItem.target as HTMLDivElement;
                    const innerText = target.innerText;
                    setListItems(stableItems.map(stableItem => {
                      const condition = stableItem.title === innerText;
                      return {
                        ...stableItem,
                        open: condition ? true : false,
                        selected: condition ? true : false,
                      };
                    }));
                    subString !== "" && setSubString("");
                    setCategory(innerText);
                  }}
                  selected={li.selected}
                >
                  <ListItemText primary={li.title} />
                  {li.open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={li.open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {li.contents.map((subItem) => {
                      return (
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={clickedItem => {
                            const target = clickedItem.target as HTMLDivElement;
                            const innerText = target.innerText;
                            setListItems(
                              stableItems.map(stableItem => {
                                return {
                                  ...stableItem,
                                  open: stableItem.contents
                                    .map(el => el.text)
                                    .includes(innerText) && true,
                                  contents: stableItem.contents
                                    .map(stableSubItem => {
                                      return {
                                        ...stableSubItem,
                                        selected: stableSubItem.text === innerText && true,
                                      };
                                    }),
                                };
                              })
                            );
                            category !== "" && setCategory("");
                            setSubCategory(innerText);
                          }}
                          selected={subItem.selected}
                        >
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </>
            );
          })}
        </List>
      }
    </div>
  );
};

export default Menu;
