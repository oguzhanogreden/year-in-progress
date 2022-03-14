import React, { useEffect, useState } from "react";
import "./App.scss";
import "./Indicator.css";
import "./Canvas.css";
import "./Goal.css";
import "./Header.css";
import { DateTime } from "luxon";
import { FiArrowRight } from "react-icons/fi";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  filter,
  map,
  mergeAll,
  scan,
  shareReplay,
  switchMap,
  take,
  tap,
  timeout,
} from "rxjs/operators";
import { of, Subject } from "rxjs";
import { GoalResponse, UserResponse } from "reactive-beeminder-client/dist/api";
import { Client, IClient } from "reactive-beeminder-client/dist/client";
import Settings from "./Settings";
import { getJsonKey, getStringKey, storeStringKey } from "./utils/local-storage";
import GoalList from "./GoalList";
import Login, { UserLogin } from "./Login";
import Goal from "./Goal";
import { progress } from "./utils/year-progress";

const beeminderFetchClient: (t: string) => IClient = (token: string) => ({
  getGoal: (goalName, cb) => {
    const url = `https://www.beeminder.com/api/v1/users/oguzhanogreden/goals/${goalName}.json?auth_token=${token}&datapoints=true`;
    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((goal: GoalResponse) => cb(null, goal))
      .catch(err => console.log(err));
  },
  getUser: cb => {
    const url = `https://www.beeminder.com/api/v1/users/me.json?auth_token=${token}`;
    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((user: UserResponse) => cb(null, user))
      .catch(err => console.log(err));
  },
});

type Target = {
  name: string;
  target: number;
};
export const targets: Target[] = [
  // TODO: #6
  {
    name: "running",
    target: 31.05,
  },
];

type CanvasProps = React.HTMLAttributes<HTMLDivElement> & {
  displayGoals: string[];
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
    const { displayGoals } = this.props;

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
            <Goal
              key={goalSlug}
              className="Goal"
              name={goalSlug}
              slug={goalSlug}
              client={client}
            ></Goal>
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

let client = new Client({
  token: getStringKey("apiToken"),
  client: beeminderFetchClient,
});
client.setToken(getStringKey("apiToken"));

function App() {
  const [isAddingGoal, setIsAddingGoal] = useState(true);
  const [goalSlugs, setGoalSlugs] = useState([] as string[]);
  const [selectedGoalSlugs, setSelectedGoalSlugs] = useState([
    "running-duration",
  ]);
  const navigate = useNavigate();

  const handleBeeminderTokenChanged = (apiToken: string) => {
    client.setToken(apiToken);
    storeStringKey("apiToken", apiToken);
  };

  const getGoalNames = () => {
    client.userDataStream$
      .pipe(
        map(user => user.goals),
        // tap(_ => console.log(_)),
        take(1)
      )
      .subscribe(goals => setGoalSlugs(goals));
  };

  const handleGoalUnselected = (slug: string) => {
    const slugs = selectedGoalSlugs.filter(s => s !== slug);

    setSelectedGoalSlugs(slugs);
  };

  const handleGoalSelected = (slug: string) => {
    const slugs = selectedGoalSlugs.filter(s => s !== slug);

    setSelectedGoalSlugs([...slugs, slug]);
  };

  useEffect(() => {
    getGoalNames();
  });

  const handleLoginAttempt = (l: UserLogin) => {
    // Here was a clientAuthenticated$ stream.
    // Current version is just a refactor of that, not sure if its definition still makes sense.
    // TODO: Move this event to Client?
    client.userDataStream$.pipe(take(1), timeout(1000)).subscribe({
      next: _ => navigate("/year"),
      error: error => console.error("Request taking too long."),
    });
    handleBeeminderTokenChanged(l.apiToken);
  };

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={<Login loginSubmitted={handleLoginAttempt}></Login>}
        />
        <Route
          path="/year"
          element={
            <div>
              <Canvas
                displayGoals={selectedGoalSlugs}
                className="Canvas"
              ></Canvas>
              {/* <Link to="/settings">Settings</Link> */}
              {!isAddingGoal && (
                <div className="AddGoal">
                  <button onClick={() => setIsAddingGoal(true)}>
                    Add goal
                  </button>
                </div>
              )}
              {isAddingGoal && (
                <GoalList
                  closeClicked={() => setIsAddingGoal(false)}
                  goalSelected={s => handleGoalSelected(s)}
                  goalUnselected={s => handleGoalUnselected(s)}
                  goalSlugs={goalSlugs}
                ></GoalList>
              )}
            </div>
          }
        ></Route>
        <Route
          path="/settings"
          element={
            <Settings onBeeminderApiKeyChanged={handleBeeminderTokenChanged} />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
