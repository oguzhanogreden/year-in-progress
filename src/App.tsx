import React, { useEffect, useState } from "react";
import "./App.css";
import "./Indicator.css";
import "./Canvas.css";
import "./Goal.css";
import "./Header.css";
import { DateTime } from "luxon";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { filter, map, mergeAll, scan, switchMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import { GoalResponse, UserResponse } from "reactive-beeminder-client/dist/api";
import { Client, IClient } from "reactive-beeminder-client/dist/client";
import Settings from "./Settings";
import { getStringKey, storeStringKey } from "./local-storage";
import GoalList from "./GoalList";
import Login, { UserLogin } from "./Login";

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
    const url = `https://www.beeminder.com/api/v1/users/oguzhanogreden.json?auth_token=${token}`;
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
let client = new Client({
  token: getStringKey("apiToken"),
  client: beeminderFetchClient,
});

type Target = {
  name: string;
  target: number;
};
const targets: Target[] = [
  {
    name: "running",
    target: 31.05,
  },
];

const progress = () => {
  const now = DateTime.now();
  const startOfYear = DateTime.fromObject({
    year: now.year,
    day: 1,
    month: 1,
  });
  const endOfYear = startOfYear.plus({ year: 1 }).minus({ second: 1 });

  const yearDuration = endOfYear.minus(startOfYear.toMillis()).toMillis();

  const progress = now.minus(startOfYear.toMillis()).toMillis() / yearDuration;

  return +(progress * 100).toFixed(2);
};

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

type GoalProps = React.HTMLAttributes<HTMLDivElement> & {
  name: string;
  slug: string;
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
    const { slug } = this.props;
    client.getGoalData(slug);

    const relativeProgress = client.goalDataStream$.pipe(
      filter(goal => goal.slug === slug),
      switchMap(goal => of(goal.dataPoints)),
      mergeAll(),
      filter(
        dataPoint =>
          DateTime.fromSeconds(dataPoint.timestamp) >
          DateTime.fromObject({ year: 2022 })
      ), // TODO: Install luxon
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

function App() {
  const [key, setKey] = useState(getStringKey("apiToken"));
  const [isAddingGoal, setIsAddingGoal] = useState(true);
  const [goalSlugs, setGoalSlugs] = useState([] as string[]);
  const [selectedGoalSlugs, setSelectedGoalSlugs] = useState([
    "running-duration",
  ]);

  const handleBeeminderTokenChanged = (apiToken: string) => {
    client = new Client({
      client: beeminderFetchClient,
      token: apiToken,
    });
    setKey(apiToken);
    storeStringKey("apiToken", apiToken);
  };

  const getGoalNames = (key: string) => {
    client.getGoalNames();
    client.userDataStream$
      .pipe(map(user => user.goals))
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
    getGoalNames(key);
  });

  const handleUserLoggedIn = (l: UserLogin) => {
    handleBeeminderTokenChanged(l.apiToken);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Login userLoggedIn={handleUserLoggedIn}></Login>}
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
              <Settings
                onBeeminderApiKeyChanged={handleBeeminderTokenChanged}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
