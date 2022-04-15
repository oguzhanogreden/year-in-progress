import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { Client, IClient } from "reactive-beeminder-client/dist/client";
import { progress } from "../../../utils/year-progress";
import GoalComponent from "./Goal";

type CanvasProps = React.HTMLAttributes<HTMLDivElement> & {
  displayGoals: string[];
  client: Client;
};

type CanvasState = {
  progress: number;
  year: number;
};

class Canvas extends React.Component<CanvasProps, CanvasState> {
  constructor(props: any) {
    super(props);
    this.state = {
      year: 2022,
      progress: progress(),
    };
  }

  render() {
    const { year, progress } = this.state;
    const { client, displayGoals } = this.props;

    return (
      <div className={this.props.className}>
        <div className="Header">
          <div className="Indicator"></div>
          <div>
            <p>This here is now.</p>
            <p>Progress: {progress}%</p>
          </div>
        </div>

        <div className="canvas__goal-container">
          {displayGoals.map(goalSlug => (
            <GoalComponent
              key={goalSlug}
              className="Goal"
              name={goalSlug}
              slug={goalSlug}
              client={client} // TODO: Add to context?
            ></GoalComponent>
          ))}
        </div>

        <div className="canvas__indicator canvas__indicator--end">
          <span className="text">This side is</span>
          <span>2023</span>
          <FiArrowRight className="arrow"></FiArrowRight>
        </div>
      </div>
    );
  }
}
export default Canvas;
