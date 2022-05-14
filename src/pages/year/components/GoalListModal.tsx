import "./GoalListModal.css";
import { FiCheck } from "react-icons/fi";
import { Goal } from "../Year";

type GoalListProps = {
  closeClicked: () => void;
  goalSelected: (goalSlug: Goal) => void;
  goalUnselected: (goalSlug: Goal) => void;
  goals: Goal[];
  isLoadingGoals: boolean;
};

function GoalListModal(props: GoalListProps) {
  const { closeClicked, goalSelected, goalUnselected, goals, isLoadingGoals } =
    props;

  return (
    <div className="GoalListModal">
      <div className="close-button" onClick={() => closeClicked()}>
        <FiCheck></FiCheck>
      </div>

      <h1>Add goals</h1>

      {isLoadingGoals && <p>Loading...</p>}

      {!isLoadingGoals &&
        goals.map(goal => (
          <div className="item-container" key={goal.slug}>
            <div className="GoalListItem">
              <input
                type="checkbox"
                id={goal.slug}
                name={goal.slug}
                checked={goal.visible}
                onChange={value => {
                  if (value.target.checked) {
                    goalSelected(goal);
                  } else {
                    goalUnselected(goal);
                  }
                }}
              ></input>

              <label className="goalSlug" htmlFor={goal.slug}>
                {goal.slug}
              </label>
            </div>
          </div>
        ))}

      {}
    </div>
  );
}

export default GoalListModal;
