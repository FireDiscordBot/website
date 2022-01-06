import MenuItem from "@mui/material/MenuItem"
import NextLink, { LinkProps } from "next/link"
import { forwardRef, ForwardRefRenderFunction, PropsWithChildren } from "react"

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

const ForwardedListItemLink = forwardRef<never, React.PropsWithChildren<AnyObject>>(ListItemLink)

type LinkAndChildrenProps = PropsWithChildren<LinkProps>

const Link: ForwardRefRenderFunction<never, LinkAndChildrenProps> = (
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

const ForwardedLink = forwardRef<never, LinkAndChildrenProps>(Link)

const MenuItemLink: ForwardRefRenderFunction<never, LinkAndChildrenProps> = ({ children, ...linkProps }, ref) => (
  <MenuItem {...linkProps} component={ForwardedLink} ref={ref}>
    {children}
  </MenuItem>
)

const ForwardedMenuItemLink = forwardRef<never, LinkAndChildrenProps>(MenuItemLink)

export default ForwardedMenuItemLink
