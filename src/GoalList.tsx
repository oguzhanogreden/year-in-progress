import "./GoalList.css";
import { FiCheck } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Client } from "reactive-beeminder-client/dist/client";
import { take, mergeMap, toArray, finalize } from "rxjs/operators";
import { defer } from "rxjs";

type GoalListProps = {
  goalSlugs?: string[];
  goalSelected: (goalSlug: string) => void;
  goalUnselected: (goalSlug: string) => void;
  closeClicked: () => void;
  client: Client;
};

function GoalList(props: GoalListProps) {
  const [goalSlugs, setGoalSlugs] = useState([] as string[]);
  const [isLoading, setIsLoading] = useState(false);

  const { closeClicked, goalSelected, goalUnselected, client } = props;

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
      finalize(() => setIsLoading(false))
    );

    getGoals$.subscribe(goals => setGoalSlugs(goals));
  };

  return (
    <div className="GoalList">
      <div className="close-button" onClick={() => closeClicked()}>
        <span>close</span>
        <FiCheck></FiCheck>
      </div>

      {isLoading && "Loading goal list..."}

      {!isLoading &&
        goalSlugs?.map(name => (
          <div key={name}>
            <input
              type="checkbox"
              id={name}
              name={name}
              onChange={value => {
                if (value.target.checked) {
                  goalSelected(name);
                } else {
                  goalUnselected(name);
                }
              }}
            ></input>
            <label htmlFor={name}>{name}</label>
          </div>
        ))}
    </div>
  );
}

export default GoalList;
