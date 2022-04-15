import { useContext, useEffect, useState } from "react";
import { Client } from "reactive-beeminder-client/dist/client";
import { map, take, tap } from "rxjs/operators";
import { AppGoal } from "../../App";
import UserContext from "../../contexts/user-context";
import GoalList from "../../GoalList";
import Canvas from "./components/Canvas";

type YearProps = {
  client: Client;
};

const Year = (props: YearProps) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState([] as AppGoal[]);

  const user = useContext(UserContext);

  return (
    <div>
      <Canvas
        client={props.client}
        displayGoals={selectedGoals.map(g => g.slug)}
        className="Canvas"
      ></Canvas>
      {/* <Link to="/settings">Settings</Link> */}
      {!isAddingGoal && (
        <div className="AddGoal">
          <button onClick={() => setIsAddingGoal(true)}>Add goal</button>
        </div>
      )}
      {isAddingGoal && (
        <GoalList
          closeClicked={() => setIsAddingGoal(false)}
          goalSelected={slug => {
            setSelectedGoals([...selectedGoals, { slug: slug }]);
          }}
          goalUnselected={s => {
            setSelectedGoals(selectedGoals.filter(g => g.slug !== s));
          }}
          goalSlugs={user.goalSlugs}
        ></GoalList>
      )}
    </div>
  );
};

export default Year;
