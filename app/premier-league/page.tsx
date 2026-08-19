"use client";

import { useCallback, useEffect, useState } from "react";
import type { Fixture, PremierLeagueData, StandingRow } from "@/lib/premier-league";
import { fetchMatchDetail, fetchPremierLeague, fetchTeamFixtures } from "@/lib/premier-league";

const dateTime = new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
const text = (value: string | null | undefined) => value && value !== "null" ? value : "—";
const statValue = (value: string | null | undefined) => value && value !== "null" ? value : "Chưa có";

type View = "table" | "team" | "match";

function PageHeader({ subtitle, onBack }: { subtitle: string; onBack?: () => void }) {
  return <header className="mb-6 flex items-start justify-between gap-4">
    <div className="flex items-center gap-3">
      {onBack ? <button onClick={onBack} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-xl text-white/80" aria-label="Quay lại">‹</button> : <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-500/20 text-3xl">⚽</span>}
      <div><h1 className="font-display text-2xl font-bold">Ngoại hạng Anh</h1><p className="text-sm text-white/60">{subtitle}</p></div>
    </div>
    <a href="https://www.thesportsdb.com/" target="_blank" rel="noreferrer" className="text-xs text-amber-300 underline underline-offset-4">Nguồn: TheSportsDB</a>
  </header>;
}

function TeamRow({ row, onClick }: { row: StandingRow; onClick: () => void }) {
  return <button onClick={onClick} className="grid w-full grid-cols-[34px_minmax(190px,1fr)_44px_44px_44px_56px_52px] items-center gap-1 border-b border-white/5 px-4 py-4 text-left transition-colors hover:bg-white/10 focus:bg-blue-500/15 focus:outline-none">
    <span className={`text-lg font-bold ${row.rank <= 4 ? "text-emerald-300" : row.rank >= 18 ? "text-red-300" : "text-white/60"}`}>{row.rank}</span>
    <span className="flex min-w-0 items-center gap-3">{row.badge ? <img src={row.badge} alt="" className="h-8 w-8 object-contain" /> : <span className="h-8 w-8 rounded-full bg-white/10" />}<span className="truncate text-sm font-semibold text-white">{row.team}</span></span>
    <span className="text-center text-xs text-white/70">{row.played}</span><span className="text-center text-xs text-white/70">{row.won}</span><span className="text-center text-xs text-white/70">{row.drawn}</span><span className="text-center text-xs text-white/70">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</span><span className="text-center text-base font-bold text-amber-300">{row.points}</span>
  </button>;
}

function FixtureRow({ fixture, onClick }: { fixture: Fixture; onClick: () => void }) {
  const finished = fixture.homeScore !== null && fixture.awayScore !== null;
  return <button onClick={onClick} className="w-full border-b border-white/10 px-4 py-5 text-left transition-colors last:border-0 hover:bg-white/10 focus:bg-blue-500/15 focus:outline-none">
    <div className="mb-3 flex items-center justify-between gap-3 text-xs text-white/50"><span>{fixture.kickoff ? dateTime.format(new Date(fixture.kickoff)) : "Chưa có giờ"} · giờ Việt Nam</span><span className={finished ? "text-emerald-300" : "text-amber-300"}>{finished ? "Đã kết thúc" : "Sắp diễn ra"}</span></div>
    <div className="grid grid-cols-[1fr_80px_1fr] items-center gap-3"><span className="flex items-center justify-end gap-2 text-right text-base font-semibold">{fixture.homeTeam}{fixture.homeBadge && <img src={fixture.homeBadge} alt="" className="h-7 w-7 object-contain" />}</span><strong className="text-center text-xl text-amber-300">{finished ? `${fixture.homeScore} - ${fixture.awayScore}` : "VS"}</strong><span className="flex items-center gap-2 text-base font-semibold">{fixture.awayBadge && <img src={fixture.awayBadge} alt="" className="h-7 w-7 object-contain" />}{fixture.awayTeam}</span></div>
    <div className="mt-3 flex items-center justify-between text-xs text-white/40"><span>{text(fixture.venue)}{fixture.city ? ` · ${fixture.city}` : ""}</span><span className="text-amber-300">Xem thông số ›</span></div>
  </button>;
}

function TeamView({ team, fixtures, loading, onBack, onFixture }: { team: StandingRow; fixtures: Fixture[]; loading: boolean; onBack: () => void; onFixture: (fixture: Fixture) => void }) {
  return <><PageHeader subtitle={`Lịch thi đấu của ${team.team}`} onBack={onBack} /><section className="mb-5 rounded-3xl border border-blue-300/20 bg-blue-950/30 p-5"><div className="flex items-center gap-4">{team.badge && <img src={team.badge} alt="" className="h-16 w-16 object-contain" />}<div><h2 className="font-display text-2xl font-bold">{team.team}</h2><p className="mt-1 text-sm text-white/55">Mùa giải 2026–2027 · Bấm vào trận để xem chi tiết</p></div></div><div className="mt-5 grid grid-cols-4 gap-2 text-center"><div><b className="block text-xl text-amber-300">{team.points}</b><span className="text-[11px] text-white/45">Điểm</span></div><div><b className="block text-xl">{team.played}</b><span className="text-[11px] text-white/45">Trận</span></div><div><b className="block text-xl">{team.won}</b><span className="text-[11px] text-white/45">Thắng</span></div><div><b className="block text-xl">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</b><span className="text-[11px] text-white/45">Hiệu số</span></div></div></section><section className="overflow-hidden rounded-3xl border border-white/10 bg-white/10"><div className="border-b border-white/10 px-5 py-4"><h2 className="font-display text-lg font-bold">Lịch đấu chi tiết</h2><p className="mt-1 text-xs text-white/45">Tất cả trận đấu của {team.team}</p></div>{loading ? <p className="py-14 text-center text-white/50">Đang tải lịch đấu...</p> : fixtures.length ? fixtures.map(fixture => <FixtureRow key={fixture.id} fixture={fixture} onClick={() => onFixture(fixture)} />) : <p className="py-14 text-center text-white/50">Nguồn chưa có lịch chi tiết cho đội này.</p>}</section></>;
}

function StatTable({ fixture }: { fixture: Fixture }) {
  const rows: Array<[string, string | null, string | null]> = [["Số lần sút", fixture.stats.shots[0], fixture.stats.shots[1]], ["Sút trúng đích", fixture.stats.shotsOnTarget[0], fixture.stats.shotsOnTarget[1]], ["Kiểm soát bóng", fixture.stats.possession[0], fixture.stats.possession[1]], ["Lượt chuyền bóng", null, null], ["Tỷ lệ chuyền bóng chính xác", null, null], ["Phạm lỗi", fixture.stats.fouls[0], fixture.stats.fouls[1]], ["Thẻ vàng", fixture.stats.yellowCards[0], fixture.stats.yellowCards[1]], ["Thẻ đỏ", fixture.stats.redCards[0], fixture.stats.redCards[1]], ["Việt vị", null, null], ["Phạt góc", fixture.stats.corners[0], fixture.stats.corners[1]]];
  return <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827]/80"><div className="grid grid-cols-[1fr_180px_1fr] items-center gap-3 border-b border-white/10 px-5 py-5 text-center"><div className="flex items-center justify-end gap-3 font-semibold">{fixture.homeTeam}{fixture.homeBadge && <img src={fixture.homeBadge} alt="" className="h-9 w-9 object-contain" />}</div><strong className="text-2xl text-amber-300">{fixture.homeScore !== null ? `${fixture.homeScore} - ${fixture.awayScore}` : "VS"}</strong><div className="flex items-center gap-3 font-semibold">{fixture.awayBadge && <img src={fixture.awayBadge} alt="" className="h-9 w-9 object-contain" />}{fixture.awayTeam}</div></div><div className="px-5 py-3">{rows.map(([label, home, away]) => <div key={label} className="grid grid-cols-[1fr_180px_1fr] items-center border-b border-white/5 py-3 text-sm last:border-0"><span className="text-right font-semibold">{statValue(home)}</span><span className="text-center text-xs text-white/55">{label}</span><span className="font-semibold">{statValue(away)}</span></div>)}</div><div className="border-t border-white/10 px-5 py-4 text-xs leading-5 text-white/45"><p>{fixture.kickoff ? dateTime.format(new Date(fixture.kickoff)) : "Chưa có thời gian"} · {text(fixture.venue)}{fixture.city ? ` · ${fixture.city}` : ""}</p><p className="mt-1">Thông số chưa được nguồn cung cấp sẽ hiển thị “Chưa có”, không tự tạo số liệu.</p></div></section>;
}

function MatchView({ fixture, loading, onBack }: { fixture: Fixture; loading: boolean; onBack: () => void }) {
  const [tab, setTab] = useState<"timeline" | "lineup" | "stats">("stats");
  const hasEvents = Boolean(fixture.homeGoals || fixture.awayGoals);
  return <>
    <PageHeader subtitle="Chi tiết trận đấu" onBack={onBack} />
    <section className="mb-4 overflow-hidden rounded-3xl border border-white/10 bg-[#151a24]">
      <div className="grid grid-cols-3 border-b border-white/10 bg-[#101116]">
        {([["timeline", "Diễn biến chính"], ["lineup", "Đội hình ra sân"], ["stats", "Thống kê"]] as const).map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`border-b-2 px-2 py-4 text-xs font-semibold transition-colors ${tab === key ? "border-white text-white" : "border-transparent text-white/45 hover:text-white/80"}`}>{label}</button>)}
      </div>
    </section>
    {loading ? <div className="rounded-3xl bg-white/10 px-5 py-16 text-center text-white/55">Đang tải thông số trận...</div> : tab === "stats" ? <StatTable fixture={fixture} /> : tab === "timeline" ? <section className="rounded-3xl border border-white/10 bg-[#151a24] px-5 py-7"><h2 className="mb-5 text-center text-sm font-semibold uppercase tracking-wide text-white/75">Diễn biến chính</h2>{hasEvents ? <div className="grid grid-cols-2 gap-5 text-sm"><div className="text-right text-white/80">{fixture.homeGoals || "Không có sự kiện ghi bàn"}</div><div className="text-white/80">{fixture.awayGoals || "Không có sự kiện ghi bàn"}</div></div> : <p className="py-8 text-center text-sm text-white/45">Nguồn chưa cung cấp diễn biến trận đấu.</p>}</section> : <section className="rounded-3xl border border-white/10 bg-[#151a24] px-5 py-7"><h2 className="mb-5 text-center text-sm font-semibold uppercase tracking-wide text-white/75">Đội hình ra sân</h2><p className="py-8 text-center text-sm text-white/45">Nguồn miễn phí chưa cung cấp đội hình ra sân cho trận này.</p></section>}
  </>;
}

export default function PremierLeaguePage() {
  const [view, setView] = useState<View>("table"); const [data, setData] = useState<PremierLeagueData | null>(null); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(true); const [team, setTeam] = useState<StandingRow | null>(null); const [teamFixtures, setTeamFixtures] = useState<Fixture[]>([]); const [teamLoading, setTeamLoading] = useState(false); const [fixture, setFixture] = useState<Fixture | null>(null); const [fixtureLoading, setFixtureLoading] = useState(false);
  const load = useCallback(async () => { try { setError(null); setData(await fetchPremierLeague()); } catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể tải dữ liệu Ngoại hạng Anh."); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); const timer = setInterval(load, 300000); return () => clearInterval(timer); }, [load]);
  const openTeam = async (row: StandingRow) => { setTeam(row); setView("team"); setTeamLoading(true); try { setTeamFixtures(await fetchTeamFixtures(row.teamId)); } catch { setTeamFixtures([]); } finally { setTeamLoading(false); } };
  const openMatch = async (item: Fixture) => { setFixture(item); setView("match"); setFixtureLoading(true); try { setFixture(await fetchMatchDetail(item.id)); } catch { /* keep base match data */ } finally { setFixtureLoading(false); } };
  const back = () => { if (view === "match") setView(team ? "team" : "table"); else { setView("table"); setTeam(null); setTeamFixtures([]); } };

  return <main className="min-h-screen w-full bg-[linear-gradient(180deg,#071426_0%,#102c50_55%,#173d5a_100%)] text-white"><div className="mx-auto w-full max-w-md px-4 pb-28 pt-8 md:max-w-6xl md:px-0">{loading ? <div className="py-24 text-center text-white/60">Đang tải dữ liệu...</div> : error ? <div className="rounded-3xl border border-red-200/15 bg-red-950/20 px-6 py-24 text-center"><p>{error}</p><button onClick={load} className="mt-4 rounded-full bg-white/15 px-4 py-2 text-sm">Thử lại</button></div> : data && view === "table" ? <><PageHeader subtitle="Bảng xếp hạng và lịch thi đấu" /><div className="mb-4 flex items-center justify-between text-xs text-white/45"><span>Mùa giải {data.season}</span><span>Chọn một đội để xem lịch đấu</span></div><section className="overflow-hidden rounded-3xl border border-white/10 bg-white/10"><div className="min-w-[660px]"><div className="grid grid-cols-[34px_minmax(190px,1fr)_44px_44px_44px_56px_52px] gap-1 border-b border-white/10 px-4 py-3 text-[10px] text-white/45"><span>#</span><span>Câu lạc bộ</span><span className="text-center">Tr</span><span className="text-center">T</span><span className="text-center">H</span><span className="text-center">HS</span><span className="text-center">Đ</span></div>{data.standings.map(row => <TeamRow key={row.teamId || row.team} row={row} onClick={() => openTeam(row)} />)}</div></section>{data.note && <p className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-400/5 px-4 py-3 text-xs leading-5 text-amber-100/70">{data.note}</p>}<section className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="font-display text-xl font-bold">Lịch thi đấu sắp tới</h2><span className="text-xs text-white/45">Chọn trận để xem thông số</span></div><div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10">{data.fixtures.map(item => <FixtureRow key={item.id} fixture={item} onClick={() => openMatch(item)} />)}</div></section></> : data && view === "team" && team ? <TeamView team={team} fixtures={teamFixtures} loading={teamLoading} onBack={back} onFixture={openMatch} /> : data && view === "match" && fixture ? <MatchView fixture={fixture} loading={fixtureLoading} onBack={back} /> : null}</div></main>;
}
