export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
  id: number;
  name: string;
  position: Position;
  age: number;
  rating: number;
  potential: number;
  morale: number;
  fitness: number;
  wage: number;
  value: number;
  form: number;
}

export interface Club {
  name: string;
  country: string;
  stadium: string;
  budget: number;
  reputation: number;
  league: string;
  season: number;
  year: number;
  trophies: number;
  morale: number;
}

export interface Fixture {
  id: number;
  opponent: string;
  home: boolean;
  competition: 'League' | 'Cup';
  played: boolean;
  score?: {
    home: number;
    away: number;
  };
}

export interface TableRow {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface TransferTarget {
  id: number;
  name: string;
  position: Position;
  age: number;
  rating: number;
  value: number;
  wage: number;
  club: string;
}

export interface GameState {
  club: Club;
  squad: Player[];
  fixtures: Fixture[];
  table: TableRow[];
  transferTargets: TransferTarget[];
  day: number;
}

export type TabKey = 'dashboard' | 'squad' | 'transfers' | 'matches' | 'league';
