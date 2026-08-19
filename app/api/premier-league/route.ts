import { NextResponse } from "next/server";

const BASE = "https://www.thesportsdb.com/api/v1/json/3";
const LEAGUE = "4328";
const SEASON = "2026-2027";
const n = (v: string | undefined | null) => Number(v ?? 0);

async function json(url: string, revalidate: number) {
  const response = await fetch(url, { next: { revalidate } });
  const text = await response.text();
  let body: any;
  try { body = JSON.parse(text); } catch { throw new Error(`Nguồn dữ liệu trả về phản hồi không hợp lệ (${response.status}).`); }
  if (!response.ok) throw new Error(body?.message ?? `Nguồn dữ liệu lỗi (${response.status}).`);
  return body;
}

function event(item: any) {
  return {
    id: item.idEvent,
    title: item.strEvent ?? `${item.strHomeTeam} vs ${item.strAwayTeam}`,
    homeTeam: item.strHomeTeam,
    awayTeam: item.strAwayTeam,
    homeBadge: item.strHomeTeamBadge ?? null,
    awayBadge: item.strAwayTeamBadge ?? null,
    kickoff: item.strTimestamp ?? `${item.dateEvent ?? ""}T${item.strTime ?? "00:00:00"}`,
    date: item.dateEvent ?? null,
    time: item.strTime ?? null,
    homeScore: item.intHomeScore == null ? null : n(item.intHomeScore),
    awayScore: item.intAwayScore == null ? null : n(item.intAwayScore),
    status: item.strStatus ?? null,
    venue: item.strVenue ?? null,
    city: item.strCity ?? null,
    league: item.strLeague ?? "English Premier League",
    round: item.intRound ?? null,
    season: item.strSeason ?? SEASON,
    attendance: item.intSpectators == null ? null : n(item.intSpectators),
    official: item.strOfficial ?? null,
    homeGoals: item.strHomeGoalDetails ?? null,
    awayGoals: item.strAwayGoalDetails ?? null,
    stats: {
      shots: [item.intHomeShots, item.intAwayShots],
      shotsOnTarget: [item.intHomeShotsOnTarget, item.intAwayShotsOnTarget],
      possession: [item.intHomePossession, item.intAwayPossession],
      corners: [item.intHomeCorners, item.intAwayCorners],
      yellowCards: [item.intHomeYellowCards, item.intAwayYellowCards],
      redCards: [item.intHomeRedCards, item.intAwayRedCards],
      fouls: [item.intHomeFouls, item.intAwayFouls],
    },
  };
}

async function footballDataStandings() {
  const response = await fetch("https://www.football-data.co.uk/mmz4281/2526/E0.csv", { next: { revalidate: 3600 } });
  if (!response.ok) return [];
  const lines = (await response.text()).replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean).slice(1);
  const teams = new Map<string, any>();
  const ensure = (name: string) => {
    if (!teams.has(name)) teams.set(name, { team: name, teamId: `csv-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, badge: null, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: "" });
    return teams.get(name);
  };
  for (const line of lines) {
    const columns = line.split(",");
    if (columns.length < 8 || !columns[3] || !columns[4]) continue;
    const home = ensure(columns[3]); const away = ensure(columns[4]);
    const homeGoals = Number(columns[5]); const awayGoals = Number(columns[6]);
    if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) continue;
    home.played++; away.played++; home.goalsFor += homeGoals; home.goalsAgainst += awayGoals; away.goalsFor += awayGoals; away.goalsAgainst += homeGoals;
    if (homeGoals > awayGoals) { home.won++; home.points += 3; away.lost++; } else if (homeGoals < awayGoals) { away.won++; away.points += 3; home.lost++; } else { home.drawn++; away.drawn++; home.points++; away.points++; }
  }
  return [...teams.values()].sort((a, b) => (b.points - a.points) || ((b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)) || (b.goalsFor - a.goalsFor)).map((item, index) => ({ ...item, rank: index + 1, goalDifference: item.goalsFor - item.goalsAgainst }));
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const teamId = url.searchParams.get("team");
    const eventId = url.searchParams.get("event");

    if (eventId) {
      const body = await json(`${BASE}/lookupevent.php?id=${encodeURIComponent(eventId)}`, 300);
      const item = body.events?.[0];
      if (!item) throw new Error("Không tìm thấy thông tin trận đấu.");
      return NextResponse.json({ success: true, event: event(item), source: "TheSportsDB", sourceUrl: "https://www.thesportsdb.com/" });
    }

    if (teamId) {
      const [seasonBody, nextBody, lastBody] = await Promise.all([
        json(`${BASE}/eventsseason.php?id=${encodeURIComponent(teamId)}&s=${SEASON}`, 600).catch(() => ({ events: [] })),
        json(`${BASE}/eventsnext.php?id=${encodeURIComponent(teamId)}`, 300).catch(() => ({ events: [] })),
        json(`${BASE}/eventslast.php?id=${encodeURIComponent(teamId)}`, 600).catch(() => ({ events: [] })),
      ]);
      const seasonEvents = seasonBody.events ?? [];
      const events = seasonEvents.length ? seasonEvents : [...(nextBody.events ?? []), ...(lastBody.results ?? lastBody.events ?? [])];
      return NextResponse.json({ success: true, teamId, season: SEASON, fixtures: events.map(event), source: "TheSportsDB", sourceUrl: "https://www.thesportsdb.com/" });
    }

    const [currentTable, fixtures] = await Promise.all([
      json(`${BASE}/lookuptable.php?l=${LEAGUE}&s=${SEASON}`, 900).catch(() => ({ table: [] })),
      json(`${BASE}/eventsnextleague.php?id=${LEAGUE}`, 300),
    ]);
    const currentRows = currentTable.table ?? [];
    const csvRows = currentRows.length >= 20 ? [] : await footballDataStandings();
    const previousTable = currentRows.length >= 20 ? currentRows : csvRows;
    const tableIsPrevious = currentRows.length < 20 && previousTable.length >= 20;

    return NextResponse.json({
      success: true,
      league: "Ngoại hạng Anh",
      season: SEASON,
      standings: previousTable.map((item: any) => item.intRank ? ({
        rank: n(item.intRank), team: item.strTeam, teamId: item.idTeam, badge: item.strBadge ?? null,
        played: n(item.intPlayed), won: n(item.intWin), drawn: n(item.intDraw), lost: n(item.intLoss),
        goalsFor: n(item.intGoalsFor), goalsAgainst: n(item.intGoalsAgainst), goalDifference: n(item.intGoalDifference), points: n(item.intPoints), form: item.strForm ?? "",
      }) : item),
      fixtures: (fixtures.events ?? []).slice(0, 20).map(event),
      source: "TheSportsDB",
      sourceUrl: "https://www.thesportsdb.com/",
      updatedAt: new Date().toISOString(),
      note: tableIsPrevious ? "Mùa giải 2026-2027 chưa đủ dữ liệu xếp hạng; danh sách 20 đội và số liệu đang lấy từ kết quả mùa 2025-2026 của Football-Data.co.uk." : (previousTable.length ? null : "Mùa giải mới chưa có bảng xếp hạng sau trận đấu đầu tiên."),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Không thể tải dữ liệu bóng đá." }, { status: 502 });
  }
}
