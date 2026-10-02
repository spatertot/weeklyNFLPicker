export type RecentGame =
  | { week: number; isBye: true }
  | {
      week: number;
      isBye: false;
      teamScore: string;
      opponentName: string;
      opponentScore: string;
      isHome: boolean;
    };

interface Props {
  teamName: string;
  teamRecord: string;
  recentGames: RecentGame[];
  onSelectedTeam: (teamName: string) => void;
}

function TeamCard({ teamName, teamRecord, recentGames }: Props) {
  // load all logo assets at build time (Vite)
  const images = import.meta.glob('../assets/nflLogos/*.{png,jpg,jpeg,svg}', { eager: true }) as Record<string, { default: string }>;

  // build a case-insensitive map: filenameWithoutExt -> url
  const logoMap: Record<string, string> = {};
  Object.keys(images).forEach((p) => {
    const file = p.split('/').pop() || p;
    const name = file.replace(/\.[^/.]+$/, ''); // remove extension
    logoMap[name.toLowerCase()] = images[p].default;
  });

  // try direct match, then normalized variants
  const lookupKeys = [
    teamName,
    teamName.replace(/\s+/g, ''), // remove spaces (e.g., "49ers" stays "49ers", "SanFrancisco" variant)
  ].map(k => k.toLowerCase());

  let logoUrl: string | undefined;
  for (const k of lookupKeys) {
    if (logoMap[k]) {
      logoUrl = logoMap[k];
      break;
    }
  }

  return (
    <>
      <div
        className="card h-100 border-0"
        /* removed onClick from here so parent wrapper handles clicks */
        style={{ width: "100%", height: "100%", boxSizing: "border-box", background: "transparent" }}
      >
        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center h-100" style={{ padding: 16 }}>
          {logoUrl && (
            <img
              src={logoUrl}
              alt={`${teamName} logo`}
              style={{ width: 72, height: 72, objectFit: "contain", marginBottom: 12 }}
            />
          )}
          <div>
            <div style={{ fontWeight: 700 }}>{teamName}</div>
            <div style={{ fontSize: 12, color: "#555" }}>{teamRecord}</div>
            {recentGames.length > 0 && (
              <div
                aria-label="Recent game results"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  width: "min(100%, 190px)",
                  margin: "10px auto 0",
                  textAlign: "left"
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#777" }}>
                  RECENT WEEKS
                </div>
                {recentGames.map((game) => game.isBye ? (
                  <div
                    key={`${game.week}-bye`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "5px 7px",
                      borderRadius: 7,
                      background: "rgba(255, 255, 255, 0.6)",
                      border: "1px dashed #c8ced4"
                    }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#69727a" }}>BYE</span>
                    <span style={{ flex: 1, fontSize: 10, fontWeight: 650, color: "#555" }}>No game</span>
                    <span style={{ fontSize: 8, color: "#777" }}>WEEK {game.week}</span>
                  </div>
                ) : (
                  <div
                    key={`${game.week}-${game.opponentName}`}
                    title={`Your score: ${game.teamScore}; ${game.opponentName}: ${game.opponentScore}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "5px 7px",
                      borderRadius: 7,
                      background: "rgba(255, 255, 255, 0.82)",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
                    }}
                  >
                    <span
                      style={{
                        minWidth: 20,
                        padding: "2px 3px",
                        borderRadius: 4,
                        background: Number(game.teamScore) > Number(game.opponentScore) ? "#e7f5ec" : "#fdebec",
                        color: Number(game.teamScore) > Number(game.opponentScore) ? "#18743b" : "#b02a37",
                        fontSize: 9,
                        fontWeight: 800,
                        textAlign: "center"
                      }}
                    >
                      {Number(game.teamScore) > Number(game.opponentScore) ? "W" : "L"}
                    </span>
                    <div style={{ minWidth: 0, flex: 1, lineHeight: 1.15 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 10, fontWeight: 650 }}>
                        {game.isHome ? "vs" : "@"} {game.opponentName}
                      </div>
                      <div style={{ marginTop: 2, fontSize: 8, color: "#777" }}>
                        WEEK {game.week}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, fontSize: 11, fontWeight: 750, color: "#333" }}>
                      {game.teamScore}<span style={{ color: "#999", margin: "0 2px" }}>–</span>{game.opponentScore}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default TeamCard;
