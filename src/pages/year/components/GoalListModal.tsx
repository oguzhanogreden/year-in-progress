import "./GoalListModal.css";
import { FiCheck } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Client } from "reactive-beeminder-client/dist/client";
import { take, mergeMap, toArray, finalize, map } from "rxjs/operators";
import { defer } from "rxjs";

type GoalListProps = {
  goalSlugs?: string[];
  selectedGoalSlugs: string[];
  goalSelected: (goalSlug: string) => void;
  goalUnselected: (goalSlug: string) => void;
  closeClicked: () => void;
  client: Client;
};

function GoalListModal(props: GoalListProps) {
  const {
    closeClicked,
    goalSelected,
    goalUnselected,
    selectedGoalSlugs,
    client,
  } = props;

  const [goalSlugs, setGoalSlugs] = useState([] as string[]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getGoalSlugs();
  }, []);

  const getGoalSlugs = () => {
    const getGoals$ = defer(() => {
      setIsLoading(true);

      return client.userDataStream$;
    }).pipe(
      take(1),
      mergeMap(user => user.goals),
      toArray(),
      map(goalSlugs => goalSlugs.sort()),
      finalize(() => setIsLoading(false))
    );

    getGoals$.subscribe(goals => setGoalSlugs(goals));
  };

  return (
    <div className="GoalListModal">
      <div className="close-button" onClick={() => closeClicked()}>
        {/* <span>close</span> */}
        <FiCheck></FiCheck>
      </div>

      <h1>Add goals</h1>

      {isLoading && "Loading goal list..."}

      {!isLoading &&
        goalSlugs?.map(goalSlug => (
          <div className="item-container" key={goalSlug}>
            <div className="GoalListItem">
              <input
                type="checkbox"
                id={goalSlug}
                name={goalSlug}
                checked={selectedGoalSlugs.includes(goalSlug)}
                onChange={value => {
                  if (value.target.checked) {
                    goalSelected(goalSlug);
                  } else {
                    goalUnselected(goalSlug);
                  }
                }}
              ></input>

              <label className="goalSlug" htmlFor={goalSlug}>
                {goalSlug}
              </label>
            </div>
          </div>
        ))}
    </div>
  );
}

export default GoalListModal;
