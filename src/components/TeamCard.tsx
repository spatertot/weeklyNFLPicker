interface Props {
  teamName: string;
  onSelectedTeam: (teamName: string) => void;
}

function TeamCard({ teamName, onSelectedTeam }: Props) {
  return (
    <>
      <div
        className="card"
        onClick={() => {
          onSelectedTeam(teamName);
        }}
      >
        <div className="card-body">This is a card for {teamName}.</div>
      </div>
    </>
  );
}

export default TeamCard;
