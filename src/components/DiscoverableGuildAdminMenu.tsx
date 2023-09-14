import { Clear, ContentCopy, Remove, Star } from "@mui/icons-material"
import { ListItemIcon, ListItemText } from "@mui/material"
import Menu, { MenuProps } from "@mui/material/Menu"
import MenuItem, { MenuItemProps } from "@mui/material/MenuItem"

import { DiscoverableGuild } from "@/interfaces/aether"

type Props = MenuProps & {
  onClickFeature: MenuItemProps["onClick"]
  onClickRemove: MenuItemProps["onClick"]
  onClickCopyInvite: MenuItemProps["onClick"]
  guild?: DiscoverableGuild
}

const DiscoverableGuildAdminMenu = ({ onClickFeature, onClickRemove, onClickCopyInvite, guild, ...props }: Props) => (
  <Menu
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    anchorEl={null}
    keepMounted
    {...props}
  >
    <MenuItem onClick={onClickCopyInvite} id="discover-menu-copy-invite">
      <ListItemIcon>
        <ContentCopy />
      </ListItemIcon>
      <ListItemText primary="Copy Invite" />
    </MenuItem>
    <MenuItem onClick={onClickFeature} id="discover-menu-feature">
      <ListItemIcon>{guild?.featured ? <Remove /> : <Star />}</ListItemIcon>
      <ListItemText primary={guild?.featured ? "Unfeature" : "Feature"} />
    </MenuItem>
    <MenuItem onClick={onClickRemove} id="discover-menu-remove">
      <ListItemIcon>
        <Clear />
      </ListItemIcon>
      <ListItemText primary="Remove" />
    </MenuItem>
  </Menu>
)

export default DiscoverableGuildAdminMenu
