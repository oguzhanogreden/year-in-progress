import { DateTime } from "luxon";
import React, { useContext, useEffect, useState } from "react";
import { filter, last, map, mergeAll, scan } from "rxjs/operators";
import { fetchGoal } from "../../../beeminder/fetch";
import UserContext, { AppGoal, Target } from "../../../contexts/user-context";
import { progress } from "../../../utils/year-progress";
// import "./Goal.css";

type GoalProps = {
  goal: AppGoal;
};

export const targets: Map<string, Target> = new Map([
  ["budget-groceries", { target: 12 * 200 }],
  ["d-srs", { target: 12 * 200 }],
]);

function GoalComponent(props: GoalProps) {
  const [relativeProgress, setRelativeProgress] = useState(0);
  const [target, setTarget] = useState(targets.get(props.goal.slug));
  const user = useContext(UserContext);

  const hasTarget = () => target !== undefined;

  useEffect(() => {
    loadProgress();
  }, [props.goal]);

  const fetchGoalDetails = (slug: string) =>
    fetchGoal(user.apiToken, slug).pipe(
      map(g => g.dataPoints),
      mergeAll(),
      filter(
        dataPoint =>
          DateTime.fromSeconds(dataPoint.timestamp) >
          DateTime.fromObject({ year: 2022 })
      ),
      map(dataPoint => dataPoint.value),
      scan((total, value) => total + value, 0),
      last(),
      map(total => {
        const percentProgress = target ? (total / target.target) * 100 : 0;
        return percentProgress - progress();
      })
    );

  const loadProgress = () => {
    const { goal } = props;
    const relativeProgress = fetchGoalDetails(goal.slug);

    relativeProgress.subscribe({
      next: p => setRelativeProgress(p),
    });
  };

  function getStyle(): React.CSSProperties {
    return {
      left: `${relativeProgress}%`,
    };
  }

  // PICKUP: Implement target setting

  return (
    <div className={`Goal ${target ? "" : "no-target"}`} style={getStyle()}>
      {/* CONV */}
      <p className="goal--title">{props.goal.slug}</p>
    </div>
  );
}

export default GoalComponent;
