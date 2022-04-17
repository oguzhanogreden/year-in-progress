import { useContext, useState } from "react";
import { Client } from "reactive-beeminder-client/dist/client";
import UserContext, { AppGoal } from "../../contexts/user-context";
import GoalListModal from "./components/GoalListModal";
import Canvas from "./components/Canvas";
import "./AddGoal.scss";
import { filter, take } from "rxjs/operators";

type YearProps = {
  client: Client;
};

const Year = (props: YearProps) => {
  // Longterm-TODO:
  // - Initial render with isAddingGoal===true?

  const [isAddingGoal, setIsAddingGoal] = useState(false);
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

  const handleGoalSelected = (goalSlug: string) => {
    client.getGoalData(goalSlug);
    client.goalDataStream$
      .pipe(
        filter(goal => goal.slug === goalSlug),
        take(1)
      )
      .subscribe(goal => setGoals([...goals, goal]));
  };

  return (
    <div>
      <Canvas client={client} displayGoals={goals} className="Canvas"></Canvas>

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
          goalSelected={slug => handleGoalSelected(slug)}
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
