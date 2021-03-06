import * as React from "react"
import Menu, {MenuProps} from "@material-ui/core/Menu"
import MenuItem, {MenuItemProps} from "@material-ui/core/MenuItem"

import MenuItemLink from "./MenuItemLink"
import {AccountCircle, Event, ExitToApp, Star} from "@material-ui/icons";
import {ListItemIcon, ListItemText} from "@material-ui/core";


type Props = MenuProps & { onClickLogout: MenuItemProps["onClick"] }

const UserAvatarMenu = ({onClickLogout, ...props}: Props) => (
  <Menu
    anchorOrigin={{
      vertical: "center",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    getContentAnchorEl={null}
    keepMounted
    {...props}
  >
    <MenuItemLink href="/user/account">
      <ListItemIcon>
        <AccountCircle/>
      </ListItemIcon>
      <ListItemText primary="Account"/>
    </MenuItemLink>
    <MenuItemLink href="/user/premium">
      <ListItemIcon>
        <Star/>
      </ListItemIcon>
      <ListItemText primary="Premium"/>
    </MenuItemLink>
    <MenuItemLink href="/user/reminders">
      <ListItemIcon>
        <Event/>
      </ListItemIcon>
      <ListItemText primary="Reminders"/>
    </MenuItemLink>
    <MenuItem onClick={onClickLogout}>
      <ListItemIcon>
        <ExitToApp/>
      </ListItemIcon>
      <ListItemText primary="Logout"/>
    </MenuItem>
  </Menu>
)

export default UserAvatarMenu
