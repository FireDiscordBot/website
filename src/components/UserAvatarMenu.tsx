import * as React from "react"
import Menu, { MenuProps } from "@mui/material/Menu"
import MenuItem, { MenuItemProps } from "@mui/material/MenuItem"
import { AccountCircle, Event, ExitToApp, Star, Code } from "@mui/icons-material"
import { ListItemIcon, ListItemText } from "@mui/material"

import MenuItemLink from "./MenuItemLink"

import { handler } from "@/pages/_app"

type Props = MenuProps & { onClickLogout: MenuItemProps["onClick"] }

const UserAvatarMenu = ({ onClickLogout, ...props }: Props) => (
  <Menu
    anchorOrigin={{
      vertical: "center",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    anchorEl={null}
    keepMounted
    {...props}
  >
    <MenuItemLink href="/user/account">
      <ListItemIcon>
        <AccountCircle />
      </ListItemIcon>
      <ListItemText primary="Account" />
    </MenuItemLink>
    <MenuItemLink href="/user/premium">
      <ListItemIcon>
        <Star />
      </ListItemIcon>
      <ListItemText primary="Premium" />
    </MenuItemLink>
    <MenuItemLink href="/user/reminders">
      <ListItemIcon>
        <Event />
      </ListItemIcon>
      <ListItemText primary="Reminders" />
    </MenuItemLink>
    {handler?.isSuperuser() && (
      <MenuItemLink href="/user/admin">
        <ListItemIcon>
          <Code />
        </ListItemIcon>
        <ListItemText primary="Admin" />
      </MenuItemLink>
    )}
    <MenuItem onClick={onClickLogout} id="user-menu-logout">
      <ListItemIcon>
        <ExitToApp />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </MenuItem>
  </Menu>
)

export default UserAvatarMenu
