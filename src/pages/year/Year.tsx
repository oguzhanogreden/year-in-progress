import { useContext, useState } from "react";
import { Client } from "reactive-beeminder-client/dist/client";
import UserContext, { AppGoal } from "../../contexts/user-context";
import GoalListModal from "./components/GoalListModal";
import Canvas from "./components/Canvas";

type YearProps = {
  client: Client;
};

const Year = (props: YearProps) => {
  // Longterm-TODO:
  // - Initial render with isAddingGoal===true?

  const [isAddingGoal, setIsAddingGoal] = useState(true);
  const [goals, setGoals] = useState([] as AppGoal[]);

  const user = useContext(UserContext);

  const { client } = props;

  const handleAddGoalClicked = () => {
    client.getUser();
    setIsAddingGoal(true);
  };

  const handleAddGoalClosed = () => {
    setIsAddingGoal(false);
  };

  return (
    <div>
      <Canvas
        client={client}
        displayGoals={goals.map(g => g.slug)}
        className="Canvas"
      ></Canvas>

      {/* <Link to="/settings">Settings</Link> */}

      {!isAddingGoal && (
        <div className="AddGoal">
          <button onClick={() => handleAddGoalClicked()}>Add goal</button>
        </div>
      )}

      {isAddingGoal && (
        <GoalListModal
          client={client}
          closeClicked={() => handleAddGoalClosed()}
          goalSelected={slug => {
            setGoals([...goals, { slug: slug }]);
          }}
          goalUnselected={s => {
            setGoals(goals.filter(g => g.slug !== s));
          }}
          selectedGoalSlugs={goals.map(g => g.slug)}
        ></GoalListModal>
      )}
    </div>
  );
};

export default Year;
