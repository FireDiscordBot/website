import Tooltip from "@mui/material/Tooltip"
import Image from "next/image"

import type { DiscordFlag } from "@/interfaces/discord"

interface DiscordFlagImageProps {
  flag: DiscordFlag
}

const DiscordFlagImage = ({ flag }: DiscordFlagImageProps) => (
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
