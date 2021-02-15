import * as React from "react"
import clsx from "clsx"
import { GetServerSideProps } from "next"
import Paper from "@material-ui/core/Paper"
import Container from "@material-ui/core/Container"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import Box from "@material-ui/core/Box"
import Grid from "@material-ui/core/Grid"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import { fire } from "@/constants"
import { Category } from "@/interfaces/aether"
import Default from "../layouts/default"
import CommandAccordion from "@/components/CommandAccordion"

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      display: "flex",
    },
    fullHeight: {
      height: "100%",
    },
    borderRight: {
      borderRight: `1px solid ${theme.palette.divider}`,
    },
  }),
)

type Props = {
  categories: Category[]
  prefix?: string
}

const CommandsPage = ({ categories, prefix }: Props) => {
  const classes = useStyles()
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"))
  const [selectedCategoryIndex, setSelectedCategoryIndex] = React.useState<number>(0)

  const onChangeSelectedTab = (_event: React.ChangeEvent<unknown>, index: number) => {
    setSelectedCategoryIndex(index)
  }

  return (
    <Default>
      <Container>
        <Grid container>
          <Grid item xs={12} md={2}>
            <Paper className={classes.fullHeight}>
              <Tabs
                orientation={!isMobile ? "vertical" : "horizontal"}
                variant="scrollable"
                value={selectedCategoryIndex}
                onChange={onChangeSelectedTab}
                className={clsx(classes.fullHeight, {
                  [classes.borderRight]: !isMobile,
                })}
              >
                {categories.map((category, index) => (
                  <Tab label={category.name} key={index} />
                ))}
              </Tabs>
            </Paper>
          </Grid>
          <Grid item xs={12} md={10}>
            {categories.map(
              (category, index) =>
                selectedCategoryIndex == index && (
                  <Box p={3} width="100%" key={index}>
                    {category.commands.map((command, index) => (
                      <CommandAccordion command={command} prefix={prefix ?? fire.defaultPrefix} key={index} />
                    ))}
                  </Box>
                ),
            )}
          </Grid>
        </Grid>
      </Container>
    </Default>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  let categories: Category[]

  try {
    const response = await fetch(`${fire.aetherApiUrl}/commands`, {
      mode: "cors",
      headers: { "User-Agent": "Fire Website" },
    })
    categories = await response.json()
  } catch (e) {
    categories = []
  }

  return {
    props: {
      categories,
      prefix: (context.query.prefix as string) ?? null,
    },
  }
}

export default CommandsPage
