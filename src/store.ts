import type { Club, Fixture, GameState, Player, Position, TableRow, TransferTarget } from './types';

const teamNames = [
  'Northbridge FC',
  'Harbor City',
  'Lakeside Athletic',
  'Royal Park',
  'Seaford United',
  'Summit Rovers',
  'Crescent Athletic',
  'Whitewater FC'
];

const firstNames = ['Liam', 'Noah', 'Ethan', 'Lucas', 'Mason', 'Owen', 'Leo', 'Mateo', 'Kai', 'Ezra', 'Ruben', 'Aiden'];
const lastNames = ['Hughes', 'Brooks', 'Turner', 'Reed', 'Ward', 'Bennett', 'Powell', 'Cole', 'Fisher', 'Gray', 'Morris', 'Barnes'];

const positionPool: Position[] = ['GK', 'DEF', 'MID', 'FWD'];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function makePlayer(id: number, position: Position, age: number): Player {
  const base = {
    GK: 68,
    DEF: 72,
    MID: 74,
    FWD: 76
  }[position];

  const rating = clamp(Math.round(base + randomBetween(-8, 16) + (age < 22 ? 5 : 0) - (age > 30 ? 4 : 0)), 55, 90);
  const potential = clamp(Math.round(rating + randomBetween(2, 12)), 60, 95);
  const morale = clamp(Math.round(randomBetween(60, 90)), 40, 99);
  const fitness = clamp(Math.round(randomBetween(65, 95)), 35, 99);
  const wage = Math.round((rating * 1100) + randomBetween(12000, 60000));
  const value = Math.round((rating * 120000) + randomBetween(250000, 1500000));
  const form = clamp(Math.round(randomBetween(55, 90)), 40, 99);

  return {
    id,
    name: `${firstNames[id % firstNames.length]} ${lastNames[(id * 3) % lastNames.length]}`,
    position,
    age,
    rating,
    potential,
    morale,
    fitness,
    wage,
    value,
    form
  };
}

function createSquad(): Player[] {
  const squad: Player[] = [];
  let idCounter = 1;

  const positions: Position[] = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'];

  positions.forEach((position, index) => {
    const age = 18 + (index % 8) + Math.floor(Math.random() * 8);
    squad.push(makePlayer(idCounter++, position, age));
  });

  return squad;
}

export function createLeagueTable(): TableRow[] {
  return teamNames.map((team) => ({
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  }));
}

export function buildFixtures(): Fixture[] {
  const fixtures: Fixture[] = [];
  const ordered = [...teamNames];
  const clubIndex = ordered.indexOf('Northbridge FC');
  const otherTeams = ordered.filter((team) => team !== 'Northbridge FC');

  otherTeams.forEach((opponent, index) => {
    fixtures.push({
      id: index + 1,
      opponent,
      home: index % 2 === 0,
      competition: 'League',
      played: false
    });
  });

  const remaining = teamNames.filter((team) => team !== 'Northbridge FC' && !otherTeams.includes(team));
  remaining.forEach((team) => {
    fixtures.push({
      id: fixtures.length + 1,
      opponent: team,
      home: fixtureSideForOpponent(team, clubIndex),
      competition: 'League',
      played: false
    });
  });

  return fixtures.slice(0, 5);
}

function fixtureSideForOpponent(opponent: string, clubIndex: number): boolean {
  return opponent.charCodeAt(0) % 2 === clubIndex % 2;
}

export function createTransferTargets(): TransferTarget[] {
  return Array.from({ length: 6 }, (_, index) => {
    const position = positionPool[index % positionPool.length];
    const rating = 70 + Math.round(Math.random() * 14);

    return {
      id: 100 + index,
      name: `${firstNames[(index + 2) % firstNames.length]} ${lastNames[(index + 4) % lastNames.length]}`,
      position,
      age: 19 + Math.floor(Math.random() * 8),
      rating,
      wage: Math.round((rating * 1200) + randomBetween(16000, 80000)),
      value: Math.round((rating * 140000) + randomBetween(400000, 2400000)),
      club: teamNames[(index + 3) % teamNames.length]
    };
  });
}

export function calculateClubRating(squad: Player[]): number {
  if (squad.length === 0) {
    return 72;
  }

  const total = squad.reduce((sum, player) => sum + player.rating, 0);
  return total / squad.length;
}

export function createInitialState(): GameState {
  const club: Club = {
    name: 'Northbridge FC',
    country: 'England',
    stadium: 'The Valley Grounds',
    budget: 5600000,
    reputation: 70,
    league: 'Premier Division',
    season: 1,
    year: 2026,
    trophies: 0,
    morale: 74,
  };

  return {
    club,
    squad: createSquad(),
    fixtures: buildFixtures(),
    table: createLeagueTable(),
    transferTargets: createTransferTargets(),
    day: 1
  };
}

export function simulateMatchResult(awayTeam: string, homeTeam: string, homeStrength: number, awayStrength: number) {
  const homeGoalChance = clamp(Math.round((homeStrength - awayStrength) / 4 + 1.2 + randomBetween(-0.8, 1.8)), 0, 4);
  const awayGoalChance = clamp(Math.round((awayStrength - homeStrength) / 5 + 0.8 + randomBetween(-0.6, 1.6)), 0, 4);

  const homeGoals = clamp(Math.round(Math.max(0, homeGoalChance + randomBetween(-1.2, 1.8))), 0, 4);
  const awayGoals = clamp(Math.round(Math.max(0, awayGoalChance + randomBetween(-1.2, 1.8))), 0, 4);

  return {
    home: homeGoals,
    away: awayGoals,
    homeTeam,
    awayTeam
  };
}

export function applyResultToTable(table: TableRow[], fixture: Fixture, result: { home: number; away: number; homeTeam: string; awayTeam: string }): TableRow[] {
  const nextTable = table.map((row) => ({ ...row }));

  const homeIndex = nextTable.findIndex((row) => row.team === result.homeTeam);
  const awayIndex = nextTable.findIndex((row) => row.team === result.awayTeam);

  if (homeIndex === -1 || awayIndex === -1) {
    return nextTable;
  }

  const homeRow = nextTable[homeIndex];
  const awayRow = nextTable[awayIndex];

  homeRow.played += 1;
  awayRow.played += 1;
  homeRow.goalsFor += result.home;
  homeRow.goalsAgainst += result.away;
  awayRow.goalsFor += result.away;
  awayRow.goalsAgainst += result.home;

  if (result.home > result.away) {
    homeRow.wins += 1;
    homeRow.points += 3;
    awayRow.losses += 1;
  } else if (result.home < result.away) {
    awayRow.wins += 1;
    awayRow.points += 3;
    homeRow.losses += 1;
  } else {
    homeRow.draws += 1;
    awayRow.draws += 1;
    homeRow.points += 1;
    awayRow.points += 1;
  }

  homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;
  awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;

  return nextTable.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
}
