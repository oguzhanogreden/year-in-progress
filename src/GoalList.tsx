import "./GoalList.css";
import { FiCheck } from "react-icons/fi";

type GoalListProps = {
  goalSlugs?: string[];
  goalSelected: (goalSlug: string) => void;
  goalUnselected: (goalSlug: string) => void;
  closeClicked: () => void;
};

function GoalList(props: GoalListProps) {
  const { closeClicked, goalSelected, goalUnselected, goalSlugs } = props;

  return (
    <div className="GoalList">
      <div className="close-button" onClick={() => closeClicked()}>
        <span>close</span>
        <FiCheck></FiCheck>
      </div>
      {goalSlugs?.map(name => (
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
