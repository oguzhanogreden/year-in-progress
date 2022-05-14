import { useCallback, useContext, useEffect, useState } from "react";
import { Client } from "reactive-beeminder-client/dist/client";
import UserContext, { AppGoal } from "../../contexts/user-context";
import GoalListModal from "./components/GoalListModal";
import Canvas from "./components/Canvas";
import "./AddGoal.scss";
import { fetchUser } from "../../beeminder/fetch";
import { finalize, map, mergeAll } from "rxjs";
import { useImmer } from "use-immer";

export type Goal = AppGoal & {
  visible: boolean;
};

const Year = () => {
  // Longterm-TODO:
  // - Initial render with isAddingGoal===true?

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const user = useContext(UserContext);

  const [goals, setGoals] = useImmer(new Map<string, Goal>());

  const visibleGoals = () => [...goals.values()].filter(g => g.visible);
  // const isVisibleGoal = (slug: string) =>
  //   [...goals.values()].find(g => g.slug === slug)?.visible ?? false;

  const toggleGoalVisibility = useCallback((goalSlug: string) => {
    console.log(goalSlug);
    setGoals(draft => {
      const goal = draft.get(goalSlug);

      if (!goal) {
        return;
      }

      goal.visible = !goal.visible;
    });
  }, []);

  const addGoal = useCallback((goal: Goal) => {
    console.log(goal);
    setGoals(draft => {
      if (draft.has(goal.slug)) {
        return;
      }

      draft.set(goal.slug, goal);
    });
  }, []);

  const handleAddGoalClicked = () => {
    setIsAddingGoal(true);
  };

  const handleAddGoalClosed = () => {
    setIsAddingGoal(false);
  };

  useEffect(() => {
    console.log(goals);
  }, [goals]);

  useEffect(() => {
    if (isAddingGoal) {
      const { apiToken } = user;

      setIsLoading(true);
      const s = fetchUser(apiToken)
        .pipe(
          finalize(() => setIsLoading(false)),
          map(user => user.goals),
          mergeAll()
        )
        .subscribe({
          next: response => addGoal({ ...response, visible: false }),
          error: e => console.error(e),
        });

      return () => {
        s.unsubscribe();
      };
    }
  }, [isAddingGoal]);

  return (
    <div>
      <Canvas displayGoals={visibleGoals()}></Canvas>

      {/* <Link to="/settings">Settings</Link> */}

      {!isAddingGoal && (
        <div className="AddGoal">
          <button onClick={() => handleAddGoalClicked()}>Add goal</button>
        </div>
      )}

      {isAddingGoal && (
        <GoalListModal
          closeClicked={() => handleAddGoalClosed()}
          goalSelected={goal => toggleGoalVisibility(goal.slug)}
          goalUnselected={goal => toggleGoalVisibility(goal.slug)}
          goals={[...goals.values()]}
          isLoadingGoals={isLoading}
        ></GoalListModal>
      )}
    </div>
  );
};

export default Year;
