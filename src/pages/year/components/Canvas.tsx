import React, { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Client } from "reactive-beeminder-client/dist/client";
import { progress as getProgress } from "../../../utils/year-progress";
import GoalComponent from "./Goal";
import "./Canvas.scss";
import { render } from "react-dom";

type CanvasProps = React.HTMLAttributes<HTMLDivElement> & {
  displayGoals: string[];
  client: Client;
};

function Canvas(props: CanvasProps) {
  const [progress, setProgress] = useState(getProgress());

  return (
    <div className={props.className}>
      <div className="Header">
        <div className="Indicator"></div>
        <div>
          <p>This here is now.</p>
          <p>Progress: {progress}%</p>
        </div>
      </div>

      <div className="canvas__goal-container">
        {props.displayGoals.map(goalSlug => (
          <GoalComponent
            key={goalSlug}
            className={`Goal ${false ? "invalid" : ""}`} // TODO: Replace conditional with goal.target !== null
            name={goalSlug}
            slug={goalSlug}
            client={props.client} // TODO: Add to context?
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

export default Canvas;
