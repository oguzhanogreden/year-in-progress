import { useEffect, useState } from "react";
import { Client } from "reactive-beeminder-client/dist/client";
import { map, take, tap } from "rxjs/operators";
import { AppGoal } from "../../App";
import UserContext from "../../contexts/user-context";
import GoalList from "../../GoalList";
import { getJsonKey } from "../../utils/local-storage";
import Canvas from "./components/Canvas";

type YearProps = {
  client: Client;
};

const Year = (props: YearProps) => {
  const [isAddingGoal, setIsAddingGoal] = useState(true);
  const [selectedGoals, setSelectedGoals] = useState(readGoalsFromStorage());
  const [goalSlugs, setGoalSlugs] = useState([] as string[]);

  const getGoalNames = () => {
    props.client.userDataStream$
      .pipe(
        map(user => user.goals),
        tap(_ => console.log(_)),
        take(1)
      )
      .subscribe(goals => {
        // TODO: Also refer to context here?
        setGoalSlugs(goals);
      });
  };

  useEffect(() => {
    console.log("asd");
    getGoalNames();
  });

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
        <UserContext.Consumer>
          {user => (
            <GoalList
              closeClicked={() => setIsAddingGoal(false)}
              goalSelected={slug => {
                setSelectedGoals([...selectedGoals, { slug: slug }]);
                user.setGoalSlugs([...goalSlugs, slug]);
              }}
              goalUnselected={s => {
                setSelectedGoals(selectedGoals.filter(g => g.slug !== s));
                user.setGoalSlugs(goalSlugs.filter(slug => slug !== s));
              }}
              goalSlugs={goalSlugs}
            ></GoalList>
          )}
        </UserContext.Consumer>
      )}
    </div>
  );
};
export default Year;

function readGoalsFromStorage(): AppGoal[] {
  const goals: AppGoal[] = getJsonKey("goals");

  return goals ?? [];
}
