import { useState, useEffect, FC, MouseEvent } from "react";
import {
  ListSubheader,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import axios from "axios";
import { getAds } from "../functions/functions";
import { MenuPropsType, DataMenuType, MenuType } from '../types';

const Menu: FC<MenuPropsType> = ({ getAdsProps, subString, setSubString, category, setCategory, page }) => {
  const [stableItems, setStableItems] = useState<Array<MenuType>>([]);
  const [listItems, setListItems] = useState<Array<MenuType>>([]);

  useEffect(() => {
    axios.get("/api/menu").then(({ data }) => {
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
    });
  }, []);

  useEffect(() => {
    subString === "" && category &&
      getAds({
        ...getAdsProps,
        subString: subString,
        category: category,
      });
  }, [subString, category, page]);

  return (
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
      {listItems.map((item) => {
        return (
          <>
            <ListItemButton
              onClick={clickedItem => {
                const target = clickedItem.target as HTMLDivElement;
                const innerText = target.innerText;
                setListItems(
                  stableItems.map((stableItem) => {
                    const condition = stableItem.title === innerText;
                    return {
                      ...stableItem,
                      open: condition ? true : false,
                      selected: condition ? true : false,
                    };
                  })
                );
                setSubString("");
                setCategory(innerText);
              }}
              selected={item.selected}
            >
              <ListItemText primary={item.title} />
              {item.open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={item.open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.contents.map((subItem) => {
                  return (
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={clickedItem =>
                        setListItems(
                          stableItems.map((stableItem) => {
                            const target = clickedItem.target as HTMLDivElement;
                            const text = target.innerText;
                            return {
                              ...stableItem,
                              open:
                                stableItem.contents
                                  .map((el) => el.text)
                                  .includes(text) && true,
                              contents: stableItem.contents.map(
                                (stableSubItem) => {
                                  return {
                                    ...stableSubItem,
                                    selected:
                                      stableSubItem.text === text && true,
                                  };
                                }
                              ),
                            };
                          })
                        )
                      }
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
  );
};

export default Menu;
