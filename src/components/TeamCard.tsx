interface Props {
  teamName: string;
  teamRecord: string;
  onSelectedTeam: (teamName: string) => void;
}

function TeamCard({ teamName, teamRecord, onSelectedTeam }: Props) {
  return (
    <>
      <div
        className="card"
        onClick={() => {
          onSelectedTeam(teamName);
        }}
      >
        <div className="card-body">{teamName}</div>
        <p>{teamRecord}</p>

      </div>
    </>
  );
}

export default TeamCard;
