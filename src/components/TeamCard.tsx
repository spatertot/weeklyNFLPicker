interface Props {
  teamName: string;
  teamRecord: string;
  onSelectedTeam: (teamName: string) => void;
}

function TeamCard({ teamName, teamRecord, onSelectedTeam }: Props) {
  // load all logo assets at build time (Vite)
  const images = import.meta.glob('../assets/nflLogos/*.{png,jpg,jpeg,svg}', { eager: true }) as Record<string, { default: string }>;

  // build a case-insensitive map: filenameWithoutExt -> url
  const logoMap: Record<string, string> = {};
  Object.keys(images).forEach((p) => {
    const file = p.split('/').pop() || p;
    const name = file.replace(/\.[^/.]+$/, ''); // remove extension
    logoMap[name.toLowerCase()] = (images[p] as any).default;
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
          </div>
        </div>
      </div>
    </>
  );
}

export default TeamCard;
