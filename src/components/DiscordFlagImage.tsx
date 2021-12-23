import * as React from "react"
import Image from "next/image"
import Tooltip from "@mui/material/Tooltip"

import { DiscordFlag } from "@/interfaces/discord"

type Props = {
  flag: DiscordFlag
}

const DiscordFlagImage = ({ flag }: Props) => (
  <Tooltip title={flag.name}>
    <span>
      <Image
        src={`/discord-flags/${flag.key}.png`}
        alt={flag.name}
        width={flag.width ?? 24}
        height={24}
        layout="fixed"
      />
    </span>
  </Tooltip>
)

export default DiscordFlagImage
