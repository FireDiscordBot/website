import * as React from "react"
import Menu, { MenuProps } from "@material-ui/core/Menu"
import MenuItem, { MenuItemProps } from "@material-ui/core/MenuItem"

import MenuItemLink from "./MenuItemLink"

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
    getContentAnchorEl={null}
    keepMounted
    {...props}
  >
    <MenuItemLink href="/user/account">My account</MenuItemLink>
    <MenuItemLink href="/user/premium">Premium</MenuItemLink>
    <MenuItem onClick={onClickLogout}>Logout</MenuItem>
  </Menu>
)

export default UserAvatarMenu
