export interface Server {
  name: string;
  id: string;
  icon: string;
  splash: string;
  vanity: string;
  members: number;
  key?: number;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  aliases: string;
  category?: string;
}

export interface CategoryFlag {
  name: string;
  description: string;
  usage: string;
}

export interface Category {
  id: number;
  name: string;
  commands: Command[];
  flags?: CategoryFlag[];
  Note?: string;
}

export interface Cluster {
  id: number;
  name: string;
  env: string;
  uptime: string;
  cpu: number;
  ram: string;
  version: string;
  guilds: number;
  unavailableGuilds: number;
  users: number;
  commands: number;
  events: number;
  shards: Shard[];
  error?: string;
  reason?: string;
  code?: string;
}

export interface Shard {
  id: number;
  wsPing: number;
  guilds: number;
  unavailableGuilds: number;
  users: number;
  status: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

export interface Stats {
  cpu: number;
  ram: string;
  totalRam: string;
  clusterCount: number;
  shardCount: number;
  guilds: number;
  users: number;
  clusters: Cluster[];
}
