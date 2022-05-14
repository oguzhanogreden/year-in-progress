import { FiArrowRight } from "react-icons/fi";
import { AppGoal } from "../../../contexts/user-context";
import GoalComponent from "./Goal";

type CanvasProps = {
  displayGoals: AppGoal[];
};

function Canvas(props: CanvasProps) {
  return (
    <div className="Canvas">
      <div className="canvas__goal-container">
        {props.displayGoals.map(goal => (
          <GoalComponent key={goal.slug} goal={goal}></GoalComponent>
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
