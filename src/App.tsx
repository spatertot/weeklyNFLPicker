import "bootstrap/dist/css/bootstrap.css";
import TeamCard from "./components/TeamCard.tsx";
import { useState, useEffect, useRef } from "react";

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
  const [schedule, setSchedule] = useState<Array<ScheduleFormat>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false); // Add this state
  const [currentWeek, setCurrentWeek] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);
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
    teamPicks = [];
    setGameIndex(0);
    setFinishedBoolean(false);
    setStartedBoolean(false);
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
    setIsLoading(false);
    setStartedBoolean(true); // Start app automatically after data is fetched
  };

  const determineCurrentWeek = async (): Promise<string> => {
    const currentSeason = getCurrentNFLSeason();
    const response = await fetch(
      `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${currentSeason}/types/2/weeks?lang=en&region=us`
    );

    if (!response.ok) {
      return "1";
    }

    const json = await response.json();
    const weekRefs = Array.isArray(json.items) ? json.items : [];

    if (weekRefs.length === 0) {
      return "1";
    }

    const weekDetails = (await Promise.all(
      weekRefs.map(async (item: { $ref: string }) => {
        const url = item.$ref.replace("http://", "https://");
        const res = await fetch(url);
        if (!res.ok) {
          return null;
        }
        return await res.json();
      })
    )).filter(Boolean);

    if (weekDetails.length === 0) {
      return "1";
    }

    const sortedWeeks = [...weekDetails].sort((a: any, b: any) => Number(a.number) - Number(b.number));
    const now = new Date();
    const matchingWeek = sortedWeeks.find((week: any) => {
      const startDate = new Date(week.startDate);
      const endDate = new Date(week.endDate);
      return !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && now >= startDate && now <= endDate;
    });

    if (matchingWeek) {
      return matchingWeek.number.toString();
    }

    const firstWeek = sortedWeeks[0];
    const lastWeek = sortedWeeks[sortedWeeks.length - 1];
    const firstStart = new Date(firstWeek.startDate);
    const lastEnd = new Date(lastWeek.endDate);

    if (!Number.isNaN(firstStart.getTime()) && now < firstStart) {
      return firstWeek.number.toString();
    }

    if (!Number.isNaN(lastEnd.getTime()) && now > lastEnd) {
      return lastWeek.number.toString();
    }

    return firstWeek.number.toString();
  };

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    const initialize = async () => {
      setIsLoading(true);
      try {
        const week = await determineCurrentWeek();
        setCurrentWeek(week);
        await getData(week);
      } catch (err) {
        setError("Unable to determine or load the current NFL week.");
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <h1 className="mb-4">Error</h1>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading current week...</span>
        </div>
        <div>{currentWeek ? `Loading Week ${currentWeek} schedule...` : "Determining current NFL week..."}</div>
      </div>
    );
  }
  if (isStarted && schedule[0] !== undefined && !isFinished) {
    return (
    <div className="container-fluid text-center">
      <div className="pt-3 pb-2 text-center">
        <h2 className="mb-0">Week {currentWeek ?? "?"}</h2>
      </div>
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
        <div className="mb-3 text-center">
          <span className="badge bg-primary px-3 py-2" style={{ fontSize: "1rem" }}>
            Week {currentWeek ?? "?"}
          </span>
        </div>
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
