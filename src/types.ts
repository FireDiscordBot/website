export interface Server {
  name: string;
  id: string;
  icon: string;
  splash: string;
  vanity: string;
  members: string;
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
  uptime: string;
  cpu: string;
  ram: string;
  pid: string;
  guilds: number;
  users: number;
  commands: number;
}

export interface Stats {
  clusters: Cluster[];
  cpu: string;
  ram: string;
  clusterCount: number;
  shardCount: number;
  guilds: number;
  users: number;
}