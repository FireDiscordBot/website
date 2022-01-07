import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/material/styles"

const StyledFooter = styled("footer")(({ theme }) => ({
  padding: theme.spacing(2, 0),
  marginTop: "auto",
  backgroundColor: theme.palette.grey[900],
}))

const Footer = () => (
  <StyledFooter>
    <Container sx={{ display: "flex", justifyContent: "center" }}>
      <Typography variant="caption" color="textSecondary">
        © 2022 Fire Bot. All Rights Reserved.
      </Typography>
    </Container>
  </StyledFooter>
)

export default Footer
