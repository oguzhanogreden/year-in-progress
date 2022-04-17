import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { Client } from "reactive-beeminder-client/dist/client";
import { of } from "rxjs";
import { filter, map, mergeAll, scan, switchMap } from "rxjs/operators";
import { targets } from "../../../App";
import { AppGoal } from "../../../contexts/user-context";
import { progress } from "../../../utils/year-progress";
import "./Goal.scss";

type GoalProps = React.HTMLAttributes<HTMLDivElement> & {
  goal: AppGoal;
  client: Client;
};
type GoalState = {
  relativeProgress: number;
};

function GoalComponent(props: GoalProps) {
  const [relativeProgress, setRelativeProgress] = useState(0);

  useEffect(() => {
    loadTarget();
  });

  const loadTarget = () => {
    const { goal, client } = props;

    const slug = goal.slug;

    const relativeProgress = client.goalDataStream$.pipe(
      filter(goal => goal.slug === slug),
      switchMap(goal => of(goal.dataPoints)),
      mergeAll(),
      filter(
        dataPoint =>
          DateTime.fromSeconds(dataPoint.timestamp) >
          DateTime.fromObject({ year: 2022 })
      ),
      map(dataPoint => dataPoint.value),
      scan((total, value) => total + value, 0),
      map(total => {
        const target = targets[0].target;
        const percentProgress = (total / target) * 100;
        return percentProgress - progress();
      })
    );

    relativeProgress.subscribe({
      next: relativeProgress => setRelativeProgress(relativeProgress),
    });
  };

  const style: React.CSSProperties = {
    // left: `${relativeProgress}%`,
  };
  return (
    <div
      className={`${props.className} ${props.goal.target ?? "invalid"}`}
      style={style}
    >
      {/* CONV */}
      <p>{props.goal.slug}</p>
      <p> Delta: {relativeProgress.toFixed(2)}% </p>
    </div>
  );
}

export default GoalComponent;
