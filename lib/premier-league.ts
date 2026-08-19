export interface StandingRow {
  rank: number; team: string; teamId: string; badge: string | null; played: number; won: number; drawn: number; lost: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number; points: number; form: string;
}
export interface MatchStats { shots: [string | null, string | null]; shotsOnTarget: [string | null, string | null]; possession: [string | null, string | null]; corners: [string | null, string | null]; yellowCards: [string | null, string | null]; redCards: [string | null, string | null]; fouls: [string | null, string | null]; }
export interface Fixture {
  id: string; title: string; homeTeam: string; awayTeam: string; homeBadge: string | null; awayBadge: string | null;
  kickoff: string; date: string | null; time: string | null; homeScore: number | null; awayScore: number | null;
  status: string | null; venue: string | null; city: string | null; league: string; round: string | null; season: string;
  attendance: number | null; official: string | null; homeGoals: string | null; awayGoals: string | null; stats: MatchStats;
}
export interface PremierLeagueData { league: string; season: string; standings: StandingRow[]; fixtures: Fixture[]; source: string; sourceUrl: string; updatedAt: string; note: string | null; }
export async function fetchPremierLeague(): Promise<PremierLeagueData> { const r = await fetch("/api/premier-league"); const j = await r.json(); if (!r.ok || !j.success) throw new Error(j.error ?? "Không thể tải dữ liệu Ngoại hạng Anh."); return j; }
export async function fetchTeamFixtures(teamId: string): Promise<Fixture[]> { const r = await fetch(`/api/premier-league?team=${encodeURIComponent(teamId)}`); const j = await r.json(); if (!r.ok || !j.success) throw new Error(j.error ?? "Không thể tải lịch đội bóng."); return j.fixtures; }
export async function fetchMatchDetail(eventId: string): Promise<Fixture> { const r = await fetch(`/api/premier-league?event=${encodeURIComponent(eventId)}`); const j = await r.json(); if (!r.ok || !j.success) throw new Error(j.error ?? "Không thể tải thông số trận đấu."); return j.event; }
