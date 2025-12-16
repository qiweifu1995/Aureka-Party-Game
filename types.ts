export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Team {
  id: string;
  name: string;
  members: Player[];
}

export enum AppTab {
  SCOREBOARD = 'SCOREBOARD',
  TOOLS = 'TOOLS',
  AI_HOST = 'AI_HOST',
  PLAYERS = 'PLAYERS'
}
