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
    await fetch(
      "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2025/types/2/weeks/" +
      week +
      "/events?lang=en&region=us"
    ).then((response) =>
      response.json().then((json) =>
        json.items.forEach((item: { $ref: string }) => {
          gameURLs.push(item.$ref);
        })
      )
    );
    await gameURLs.forEach((url) => {
      fetch(url.replace("http", "https")).then((response) =>
        response.json().then((json) => {
          convertFromESPNtoSimple(json.shortName);
        })
      );
    });
    setSchedule(tempSchedule);

    setDataFetchedBoolean(true);
  };

  const startApp = () => {
    setStartedBoolean(true);
  };

  if (!isStarted && !isFinished && !dataFetched) {
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
  if (!isStarted && !isFinished && dataFetched) {
    return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <button
        type="button"
        className="btn btn-primary btn-lg px-5 py-3"
        onClick={startApp}
      >
        Start
      </button>
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
          className="col-6 d-flex justify-content-center align-items-center"
          style={{
            borderRight: "3px solid #000",
            minHeight: "100vh",
            padding: 0,
          }}
        >
          <div className="w-100 d-flex align-items-center justify-content-center" style={{ minHeight: "40vh" }}>
            <TeamCard
              teamName={schedule[gameIndex].team1}
              onSelectedTeam={handleSelectTeam}
            />
          </div>
        </div>
        <div className="col-6 d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", padding: 0 }}>
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
