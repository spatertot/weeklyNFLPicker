import "bootstrap/dist/css/bootstrap.css";
import TeamCard from "./components/TeamCard.tsx";
import { useState } from "react";

let teamPicks: string[] = [];

function App() {
  let gameURLs: string[] = [];

  interface ScheduleFormat {
    team1: string;
    team2: string;
  }

  let tempSchedule: ScheduleFormat[] = [];

  const [gameIndex, setGameIndex] = useState(0);
  const [isStarted, setStartedBoolean] = useState(false);
  const [isFinished, setFinishedBoolean] = useState(false);
  const [dataFetched, setDataFetchedBoolean] = useState(false);
  const [schedule, setSchedule] = useState<Array<ScheduleFormat>>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const convertFromESPNtoSimple = (espnGameName: string) => {
    let tempTeamArray: string[] = espnGameName.split("@");
    if (tempTeamArray[1] === undefined) {
      tempTeamArray = espnGameName.split("VS");
    }
    let tempScheduleFormat: ScheduleFormat = {
      team1: nameMap.get(tempTeamArray[0].trim())!,
      team2: nameMap.get(tempTeamArray[1].trim())!,
    };
    tempSchedule.push(tempScheduleFormat);
  };

  const getData = async (week: string) => {
    setIsLoading(true);
    gameURLs = [];
    tempSchedule = [];

    const response = await fetch(
      "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2025/types/2/weeks/" +
        week +
        "/events?lang=en&region=us"
    );
    const json = await response.json();
    json.items.forEach((item: { $ref: string }) => {
      gameURLs.push(item.$ref);
    });

    await Promise.all(
      gameURLs.map(async (url) => {
        const res = await fetch(url.replace("http", "https"));
        const gameJson = await res.json();
        convertFromESPNtoSimple(gameJson.shortName);
      })
    );

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
          className="col-5 d-flex justify-content-center align-items-center"
          
        >
          <div className="w-100 d-flex align-items-center justify-content-center" style={{ minHeight: "40vh" }}>
            <TeamCard
              teamName={schedule[gameIndex].team1}
              onSelectedTeam={handleSelectTeam}
            />
          </div>
        </div>
        <div className="col-2 d-flex flex-column justify-content-center align-items-center position-relative" style={{ minHeight: "100vh" }}>
          {/* Vertical line above '@' */}
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
          {/* '@' symbol */}
          <span style={{ fontSize: "2rem", zIndex: 1, background: "#fff", padding: "0 8px" }}>
            @
          </span>
          {/* Vertical line below '@' */}
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
        <div className="col-5 d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", padding: 0 }}>
          <div className="w-100 d-flex align-items-center justify-content-center" style={{ minHeight: "40vh" }}>
            <TeamCard
              teamName={schedule[gameIndex].team2}
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
      </div>
    );
  }
}

export default App;
