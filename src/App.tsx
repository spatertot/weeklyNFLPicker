import "bootstrap/dist/css/bootstrap.css";
import TeamCard from "./components/TeamCard.tsx";
import { useState } from "react";

let teamPicks: string[] = [];

function App() {
  let gameURLs: string[] = [];

  // Dynamically determine the current NFL season
  // NFL season runs September - February of next year
  const getCurrentNFLSeason = (): number => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    const currentYear = now.getFullYear();
    
    // If we're in August (month 8) or later, the season is the current year
    // If we're before August, the season started last year
    return currentMonth >= 8 ? currentYear : currentYear - 1;
  };

  interface ScheduleFormat {
    team1: string;
    team2: string;
    team1Record: string;
    team2Record: string;
    vsFlag: boolean;
  }

  let tempSchedule: ScheduleFormat[] = [];

  const [gameIndex, setGameIndex] = useState(0);
  const [isStarted, setStartedBoolean] = useState(false);
  const [isFinished, setFinishedBoolean] = useState(false);
  const [dataFetched, setDataFetchedBoolean] = useState(false);
  const [schedule, setSchedule] = useState<Array<ScheduleFormat>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false); // Add this state
  const nameMapping = {
    DAL: "Cowboys",
    KC: "Chiefs",
    TB: "Buccaneers",
    CIN: "Bengals",
    MIA: "Dolphins",
    LV: "Raiders",
    ARI: "Cardinals",
    PIT: "Steelers",
    NYG: "Giants",
    CAR: "Panthers",
    TEN: "Titans",
    SF: "49ers",
    DET: "Lions",
    HOU: "Texans",
    BAL: "Ravens",
    MIN: "Vikings",
    PHI: "Eagles",
    LAC: "Chargers",
    ATL: "Falcons",
    CLE: "Browns",
    IND: "Colts",
    NE: "Patriots",
    NO: "Saints",
    NYJ: "Jets",
    WSH: "Commanders",
    JAX: "Jaguars",
    DEN: "Broncos",
    SEA: "Seahawks",
    GB: "Packers",
    LAR: "Rams",
    BUF: "Bills",
    CHI: "Bears",
  };
  const nameMap = new Map(Object.entries(nameMapping));
  const weeks: string[] = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18"
  ];

  const handleSelectTeam = (selectedTeamName: string) => {
    teamPicks.push(selectedTeamName);
    if (gameIndex + 1 < schedule.length) {
      //increment through games
      setGameIndex(gameIndex + 1);
    } else {
      //end state print list
      setFinishedBoolean(true);
    }
  };

  const getData = async (week: string) => {
    setIsLoading(true);
    gameURLs = [];
    tempSchedule = [];

    const currentSeason = getCurrentNFLSeason();
    const response = await fetch(
      "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/" +
        currentSeason +
        "/types/2/weeks/" +
        week +
        "/events?lang=en&region=us"
    );
    const json = await response.json();
    json.items.forEach((item: { $ref: string }) => {
      gameURLs.push(item.$ref);
    });

    // Fetch all game data in order
    const gameJsons = await Promise.all(
      gameURLs.map(async (url) => {
        const res = await fetch(url.replace("http", "https"));
        return await res.json();
      })
    );

    // Convert each game in order
    tempSchedule = await Promise.all(gameJsons.map(async (gameJson: any) => {
      let vsFlag = false;
      let tempTeamArray: string[] = gameJson.shortName.split("@");
      if (tempTeamArray[1] === undefined) {
        tempTeamArray = gameJson.shortName.split("VS");
        vsFlag = true;
      }

      // Extract records from competitors array
      let team1Record = "";
      let team2Record = "";

      const competitors = gameJson.competitions[0].competitors;
      for (const competitor of competitors) {
        const recordRes = await fetch(competitor.record.$ref.replace("http", "https"));
        const recordJson = await recordRes.json();
        const displayValue = recordJson.items[0].displayValue;
        if (competitor.homeAway === "home") {
          team2Record = displayValue;
        } else if (competitor.homeAway === "away") {
          team1Record = displayValue;
        }
      }

      return {
        team1: nameMap.get(tempTeamArray[0].trim())!,
        team2: nameMap.get(tempTeamArray[1].trim())!,
        team1Record,
        team2Record,
        vsFlag
      };
    }));

    setSchedule([...tempSchedule]);
    setDataFetchedBoolean(true);
    setIsLoading(false);
    setStartedBoolean(true); // Start app automatically after data is fetched
  };

  if (!isStarted && !isFinished && !dataFetched && !isLoading) {
    return (
    <>
      <h1>Which Week?</h1>
      <div className="container">
        <div className="row g-2">
          {weeks.map((week) => (
            <div className="col-4 d-flex justify-content-center" key={week}>
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={() => getData(week)}
              >
                {week}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
  }
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (isStarted && schedule[0] !== undefined && !isFinished) {
    return (
    <div className="container-fluid text-center">
      <div
        className="row justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="col-5 d-flex justify-content-center align-items-stretch"
          style={{ height: "100vh", padding: 0, cursor: "pointer" }}
          onClick={() => handleSelectTeam(schedule[gameIndex].team1)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleSelectTeam(schedule[gameIndex].team1);
          }}
          aria-label={`Select ${schedule[gameIndex].team1}`}
        >
          <div className="w-100 h-100 d-flex align-items-stretch justify-content-center" style={{ height: "100%" }}>
            <TeamCard
              teamName={schedule[gameIndex].team1}
              teamRecord={schedule[gameIndex].team1Record}
              onSelectedTeam={handleSelectTeam} // still fine to keep for direct child usage
            />
          </div>
        </div>
        <div className="col-2 d-flex flex-column justify-content-center align-items-center position-relative" style={{ minHeight: "100vh" }}>
          {/* Vertical line above symbol */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: "0",
              height: "45%",
              borderLeft: "3px solid #000",
              transform: "translateX(-50%)"
            }}
          />
          {/* '@' or 'VS' symbol */}
          <span style={{ fontSize: "2rem", zIndex: 1, background: "#fff", padding: "0 8px" }}>
            {schedule[gameIndex].vsFlag ? "VS" : "@"}
          </span>
          {/* Vertical line below symbol */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 0,
              width: "0",
              height: "45%",
              borderLeft: "3px solid #000",
              transform: "translateX(-50%)"
            }}
          />
        </div>
        <div
          className="col-5 d-flex justify-content-center align-items-stretch"
          style={{ height: "100vh", padding: 0, cursor: "pointer" }}
          onClick={() => handleSelectTeam(schedule[gameIndex].team2)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleSelectTeam(schedule[gameIndex].team2);
          }}
          aria-label={`Select ${schedule[gameIndex].team2}`}
        >
          <div className="w-100 h-100 d-flex align-items-stretch justify-content-center" style={{ height: "100%" }}>
            <TeamCard
              teamName={schedule[gameIndex].team2}
              teamRecord={schedule[gameIndex].team2Record}
              onSelectedTeam={handleSelectTeam}
            />
          </div>
        </div>
      </div>
    </div>
  );
  }
  if (isFinished) {
    const handleCopy = () => {
      navigator.clipboard.writeText(teamPicks.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // Hide notification after 1.5s
    };

    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <h1 className="mb-4">Your Picks</h1>
        <ul className="list-group mb-4 w-100" style={{ maxWidth: 400 }}>
          {teamPicks.map((team) => (
            <li className="list-group-item text-center" key={team}>
              {team}
            </li>
          ))}
        </ul>
        <button
          className="btn btn-secondary"
          onClick={handleCopy}
        >
          Copy Picks
        </button>
        {/* Notification */}
        <div
          style={{
            opacity: copied ? 1 : 0,
            transition: "opacity 0.3s",
            marginTop: "10px",
            color: "green",
            fontWeight: "bold",
            fontSize: "1rem"
          }}
          aria-live="polite"
        >
          Picks copied!
        </div>
      </div>
    );
  }
}

export default App;
