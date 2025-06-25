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
        {weeks.map((week) => (
          <button
            type="button"
            className="btn btn-primary"
            key={week}
            onClick={() => getData(week)}
          >
            {week}
          </button>
        ))}
      </>
    );
  }
  if (!isStarted && !isFinished && dataFetched) {
    return (
      <button type="button" className="btn btn-primary" onClick={startApp}>
        Start
      </button>
    );
  }
  if (isStarted && schedule[0] !== undefined && !isFinished) {
    return (
      <>
        <div className="container text-center">
          <div className="row align-items-start">
            <div className="col">
              <TeamCard
                teamName={schedule[gameIndex].team1}
                onSelectedTeam={handleSelectTeam}
              />
            </div>
            <div className="col">
              <TeamCard
                teamName={schedule[gameIndex].team2}
                onSelectedTeam={handleSelectTeam}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
  if (isFinished) {
    return (
      <>
        <h1>Your Picks</h1>
        <ul className="list-group">
          {teamPicks.map((team) => (
            <li className="list-group-item" key={team}>
              {team}
            </li>
          ))}
        </ul>
        {/* add copy button here */}
      </>
    );
  }
}

export default App;
