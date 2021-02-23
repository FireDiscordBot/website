import * as React from "react"
import clsx from "clsx"
import { useRouter } from "next/router"
import { GetStaticProps } from "next"
import Paper from "@material-ui/core/Paper"
import Container from "@material-ui/core/Container"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import Box from "@material-ui/core/Box"
import Grid from "@material-ui/core/Grid"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"

import fetcher from "@/utils/fetcher"
import { fire } from "@/constants"
import { Category } from "@/interfaces/aether"
import Default from "@/layouts/default"
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
}

const CommandsPage = ({ categories }: Props) => {
  const classes = useStyles()
  const router = useRouter()

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"))
  const [prefix, setPrefix] = React.useState(fire.defaultPrefix)
  const [selectedCategoryIndex, setSelectedCategoryIndex] = React.useState<number>(0)

  const onChangeSelectedTab = (_event: React.ChangeEvent<unknown>, index: number) => {
    setSelectedCategoryIndex(index)
  }

  React.useEffect(() => {
    if (typeof router.query.prefix === "string") {
      setPrefix(router.query.prefix)
    }
    if (typeof router.query.category === "string") {
      const categoryIndex = parseInt(router.query.category, 10)
      setSelectedCategoryIndex(categoryIndex)
    }
  }, [router.query])

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
                      <CommandAccordion command={command} prefix={prefix} key={index} />
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

export const getStaticProps: GetStaticProps<Props> = async () => {
  let categories: Category[]

  try {
    categories = await fetcher(`${fire.aetherApiUrl}/commands`, {
      mode: "cors",
      headers: { "User-Agent": "Fire Website" },
    })
  } catch (e) {
    categories = []
  }

  return {
    props: {
      categories,
    },
    revalidate: 1800,
  }
}

export default CommandsPage
