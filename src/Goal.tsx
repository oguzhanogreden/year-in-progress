import { DateTime } from "luxon";
import React from "react";
import { Client } from "reactive-beeminder-client/dist/client";
import { of } from "rxjs";
import { filter, map, mergeAll, scan, switchMap } from "rxjs/operators";
import { progress, targets } from "./App";

type GoalProps = React.HTMLAttributes<HTMLDivElement> & {
  name: string;
  slug: string;
  client: Client;
};
type GoalState = {
  relativeProgress: number;
};

class Goal extends React.Component<GoalProps, GoalState> {
  constructor(props: any) {
    super(props);
    this.state = { relativeProgress: 0 };
  }

  loadTarget = () => {
    const { slug, client } = this.props;
    client.getGoalData(slug);

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
      next: relativeProgress => this.setState({ relativeProgress }),
    });
  };

  componentDidMount() {
    this.loadTarget();
  }

  render() {
    const { name } = this.props;
    const { relativeProgress } = this.state;

    const style: React.CSSProperties = {
      left: `${relativeProgress}%`,
    };
    return (
      <div className={this.props.className} style={style}>
        {/* CONV */}
        <p className="goal--title">{name}</p>
        <p> Delta: {relativeProgress.toFixed(1)}% </p>
      </div>
    );
  }
}

export default Goal;
