import * as React from "react"
import NextLink, { LinkProps } from "next/link"
import MenuItem from "@material-ui/core/MenuItem"
import { AnyObject } from "@/types"

const ListItemLink: React.ForwardRefRenderFunction<never, React.PropsWithChildren<AnyObject>> = (
  { children, ...otherProps },
  ref,
) => (
  <li>
    <a {...otherProps} ref={ref}>
      {children}
    </a>
  </li>
)

const ForwardedListItemLink = React.forwardRef<never, React.PropsWithChildren<AnyObject>>(ListItemLink)

type LinkAndChildrenProps = React.PropsWithChildren<LinkProps>

const Link: React.ForwardRefRenderFunction<never, LinkAndChildrenProps> = (
  { href, as, replace, scroll, shallow, prefetch, locale, passHref, children, ...otherProps },
  ref,
) => {
  const linkProps: LinkProps = { href, as, replace, scroll, shallow, prefetch, locale, passHref: passHref ?? true }
  return (
    <NextLink {...linkProps}>
      <ForwardedListItemLink {...otherProps} ref={ref}>
        {children}
      </ForwardedListItemLink>
    </NextLink>
  )
}

const ForwardedLink = React.forwardRef<never, LinkAndChildrenProps>(Link)

const MenuItemLink: React.ForwardRefRenderFunction<never, LinkAndChildrenProps> = ({ children, ...linkProps }, ref) => (
  <MenuItem {...linkProps} component={ForwardedLink} innerRef={ref}>
    {children}
  </MenuItem>
)

const ForwardedMenuItemLink = React.forwardRef<never, LinkAndChildrenProps>(MenuItemLink)

export default ForwardedMenuItemLink
