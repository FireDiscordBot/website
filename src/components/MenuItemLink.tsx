import * as React from "react"
import Link, { LinkProps } from 'next/link'
import MenuItem from "@material-ui/core/MenuItem"

const ListItemLink = React.forwardRef<any, React.PropsWithChildren<{}>>(({ children, ...otherProps }, ref) => (
  <li>
    <a {...otherProps} ref={ref}>{children}</a>
  </li>
))

type LinkAndChildrenProps = React.PropsWithChildren<LinkProps>

const ForwardLink = React.forwardRef<any, LinkAndChildrenProps>((
  {
    href,
    as,
    replace,
    scroll,
    shallow,
    prefetch,
    locale,
    passHref,
    children,
    ...otherProps
  },
  ref,
) => {
  const linkProps: LinkProps = {
    href,
    as,
    replace,
    scroll,
    shallow,
    prefetch,
    locale,
    passHref: passHref ?? true,
  }
  return (
    <Link {...linkProps}>
      <ListItemLink {...otherProps} ref={ref}>{children}</ListItemLink>
    </Link>
  )
})

const MenuItemLink = React.forwardRef<any, LinkAndChildrenProps>(({ children, ...linkProps }, ref) => (
  <MenuItem {...linkProps} component={ForwardLink} innerRef={ref}>
    {children}
  </MenuItem>
))

export default MenuItemLink

