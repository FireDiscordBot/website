import * as React from "react"
import Avatar from "@material-ui/core/Avatar"
import IconButton, { IconButtonProps } from "@material-ui/core/IconButton"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import { AuthUser } from "@/interfaces/auth"

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1),
    },
    avatarRoot: {
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
    },
  }),
)

type Props = IconButtonProps<"button", { user: AuthUser }>

const AvatarButton = ({ user, ...otherProps }: Props) => {
  const classes = useStyles()
  return (
    <IconButton {...otherProps} className={classes.root}>
      <Avatar
        src={user.image}
        classes={{
          root: classes.avatarRoot,
        }}
      />
    </IconButton>
  )
}

export default AvatarButton
