import Avatar from "@mui/material/Avatar"
import IconButton, { IconButtonProps } from "@mui/material/IconButton"
import type { Session } from "next-auth"
import { useMemo } from "react"

import { getAvatarImageUrl } from "@/lib/discord"

type AvatarButtonProps = IconButtonProps<"button", { user: Session["user"] }>

const AvatarButton = ({ user, ...otherProps }: AvatarButtonProps) => {
  const avatarImageUrl = useMemo(
    () => getAvatarImageUrl(user.avatar, user.id, user.discriminator),
    [user.avatar, user.id, user.discriminator],
  )

  return (
    <IconButton {...otherProps} sx={{ padding: (theme) => theme.spacing(1) }} size="large">
      <Avatar
        src={avatarImageUrl}
        sx={(theme) => ({
          boxShadow: theme.shadows[2],
          "&:hover": {
            boxShadow: theme.shadows[4],
            "@media (hover: none)": {
              boxShadow: theme.shadows[2],
            },
          },
          "&$focusVisible": {
            boxShadow: theme.shadows[6],
          },
          "&:active": {
            boxShadow: theme.shadows[8],
          },
          "&$disabled": {
            boxShadow: theme.shadows[0],
          },
        })}
      />
    </IconButton>
  )
}

export default AvatarButton
