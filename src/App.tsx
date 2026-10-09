import { ArrowRight, Briefcase, CalendarDays, DollarSign, Flag, Shield, Trophy, Users } from 'lucide-react';
import { useGameStore } from './store';
import type { Fixture, Player, TabKey, TableRow, TransferTarget } from './types';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'squad', label: 'Squad' },
  { key: 'transfers', label: 'Transfers' },
  { key: 'matches', label: 'Matches' },
  { key: 'league', label: 'League' }
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
  }).format(value);
}

function averageRating(players: Player[]): number {
  if (players.length === 0) return 0;
  return Math.round(players.reduce((sum, player) => sum + player.rating, 0) / players.length);
}

function App() {
  const club = useGameStore((state) => state.club);
  const squad = useGameStore((state) => state.squad);
  const fixtures = useGameStore((state) => state.fixtures);
  const table = useGameStore((state) => state.table);
  const transferTargets = useGameStore((state) => state.transferTargets);
  const activeTab = useGameStore((state) => state.activeTab);
  const setTab = useGameStore((state) => state.setTab);
  const nextWeek = useGameStore((state) => state.nextWeek);
  const buyPlayer = useGameStore((state) => state.buyPlayer);
  const reset = useGameStore((state) => state.reset);
  const nextFixture = fixtures.find((fixture) => !fixture.played) ?? null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">Football Manager</p>
            <h1 className="text-2xl font-bold">{club.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm">
              <div className="text-slate-400">Season</div>
              <div className="font-semibold">{club.season} / {club.year}</div>
            </div>
            <button
              onClick={nextWeek}
              className="rounded-xl bg-emerald-500 px-4 py-2 font-medium text-slate-950 hover:bg-emerald-400"
            >
              Advance Week
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard icon={<DollarSign size={18} />} label="Budget" value={formatCurrency(club.budget)} tint="emerald" />
          <StatCard icon={<Users size={18} />} label="Squad Rating" value={`${averageRating(squad)}`} tint="blue" />
          <StatCard icon={<Trophy size={18} />} label="Trophies" value={`${club.trophies}`} tint="amber" />
          <StatCard icon={<Flag size={18} />} label="Morale" value={`${club.morale}%`} tint="violet" />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === tab.key ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            className="ml-auto rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
            onClick={reset}
          >
            Reset Save
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Manager Summary</h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-300">{club.league}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SummaryBox label="Stadium" value={club.stadium} />
                <SummaryBox label="Country" value={club.country} />
                <SummaryBox label="Reputation" value={`${club.reputation}/100`} />
                <SummaryBox label="Current Week" value={`Week ${club.season}`} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Next Fixture</h2>
                <CalendarDays size={18} className="text-emerald-400" />
              </div>

              {nextFixture ? (
                <div>
                  <div className="mb-2 text-sm text-slate-400">{nextFixture.competition}</div>
                  <div className="text-2xl font-bold">{club.name} vs {nextFixture.opponent}</div>
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-800 p-3 text-sm text-slate-300">
                    <span>{nextFixture.home ? 'Home' : 'Away'}</span>
                    <span>Week {Math.max(1, Math.min(12, club.season))}</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400">Season reset in progress...</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'squad' && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {squad.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}

        {activeTab === 'transfers' && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {transferTargets.map((player) => (
              <TransferCard key={player.id} player={player} onBuy={() => buyPlayer(player.id)} />
            ))}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-3">
            {fixtures.map((fixture) => (
              <MatchRow key={fixture.id} fixture={fixture} clubName={club.name} />
            ))}
          </div>
        )}

        {activeTab === 'league' && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="grid grid-cols-[2fr_repeat(6,minmax(0,1fr))] gap-2 border-b border-slate-800 bg-slate-800 p-3 text-xs uppercase tracking-wide text-slate-400">
              <div>Team</div>
              <div>P</div>
              <div>W</div>
              <div>D</div>
              <div>L</div>
              <div>GF</div>
              <div>GA</div>
              <div>Pts</div>
            </div>

            {table.map((team) => (
              <div
                key={team.team}
                className={`grid grid-cols-[2fr_repeat(6,minmax(0,1fr))] gap-2 border-b border-slate-800 p-3 text-sm ${
                  team.team === club.name ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-200'
                }`}
              >
                <div className="font-medium">{team.team}</div>
                <div>{team.played}</div>
                <div>{team.wins}</div>
                <div>{team.draws}</div>
                <div>{team.losses}</div>
                <div>{team.goalsFor}</div>
                <div>{team.goalsAgainst}</div>
                <div>{team.points}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: 'emerald' | 'blue' | 'amber' | 'violet';
}) {
  const colors = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-300'
  };

  return (
    <div className={`rounded-2xl border p-4 ${colors[tint]}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-slate-200">{label}</span>
        <span>{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-100">{value}</div>
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-xl font-semibold">{player.name}</div>
          <div className="mt-1 text-sm text-slate-400">{player.position}</div>
        </div>
        <div className="rounded-lg bg-emerald-500/15 px-2 py-1 text-sm font-semibold text-emerald-300">{player.rating}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
        <div>Age: {player.age}</div>
        <div>Form: {player.form}</div>
        <div>Morale: {player.morale}</div>
        <div>Fitness: {player.fitness}</div>
        <div>Value: {formatCurrency(player.value)}</div>
        <div>Wage: {formatCurrency(player.wage)}</div>
      </div>
    </div>
  );
}

function TransferCard({ player, onBuy }: { player: TransferTarget; onBuy: () => void }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-xl font-semibold">{player.name}</div>
          <div className="text-sm text-slate-400">{player.position} • {player.age} yrs</div>
        </div>
        <div className="rounded-lg bg-blue-500/15 px-2 py-1 text-sm font-semibold text-blue-300">{player.rating}</div>
      </div>

      <div className="mb-4 space-y-2 text-sm text-slate-300">
        <div className="flex justify-between"><span>Value</span><span>{formatCurrency(player.value)}</span></div>
        <div className="flex justify-between"><span>Wage</span><span>{formatCurrency(player.wage)}</span></div>
        <div className="flex justify-between"><span>Club</span><span>{player.club}</span></div>
      </div>

      <button
        onClick={onBuy}
        className="w-full rounded-lg bg-emerald-500 px-3 py-2 font-medium text-slate-950 hover:bg-emerald-400"
      >
        Buy Player
      </button>
    </div>
  );
}

function MatchRow({ fixture, clubName }: { fixture: Fixture; clubName: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-400">{fixture.competition}</div>
        <div className="mt-1 text-lg font-medium">
          {fixture.home ? clubName : fixture.opponent} {fixture.score ? ` ${fixture.score.home} - ${fixture.score.away} ` : 'vs'} {fixture.home ? fixture.opponent : clubName}
        </div>
      </div>
      <div className="flex items-center gap-2 text-slate-300">
        <CalendarDays size={15} />
        <span>{fixture.played ? 'Played' : 'Scheduled'}</span>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
  }).format(value);
}

export default App;


/*

A small note: this project is intentionally a compact but playable prototype with genuine multi-year progression.
It is not a literal FM26 clone, but it captures a strong football management loop.

*/
