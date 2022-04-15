import "./App.scss";
import "./Indicator.css";
import "./Canvas.css";
import "./Header.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import { map, take, tap, timeout } from "rxjs/operators";
import { GoalResponse, UserResponse } from "reactive-beeminder-client/dist/api";
import { Client, IClient } from "reactive-beeminder-client/dist/client";
import Settings from "./Settings";
import { getStringKey, storeStringKey } from "./utils/local-storage";
import Login from "./Login";
import UserContext, { Target } from "./contexts/user-context";
import Year from "./pages/year/Year";
import { useContext, useEffect } from "react";

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

export const targets: Target[] = [
  // TODO: #6
  {
    name: "running",
    target: 31.05,
  },
];

let client = new Client({
  token: getStringKey("apiToken"),
  client: beeminderFetchClient,
});
client.setToken(getStringKey("apiToken"));

function App() {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const handleBeeminderTokenChanged = (apiToken: string) => {
    client.setToken(apiToken);
    storeStringKey("apiToken", apiToken);
  };

  const handleLoginAttempt = (token: string) => {
    // Here was a clientAuthenticated$ stream.
    // Current version is just a refactor of that, not sure if its definition still makes sense.
    // TODO: Move this event to Client?
    client.userDataStream$.pipe(take(1), timeout(1000)).subscribe({
      next: _ => navigate("/year"),
      error: error => console.error("Request taking too long."),
    });
    handleBeeminderTokenChanged(token);
  };

  const getGoalNames = () => {
    client.userDataStream$
      .pipe(
        tap(_ => console.log(_)),
        map(user => user.goals),
        take(1)
      )
      .subscribe(goalSlugs => user.setGoalSlugs(goalSlugs));
  };

  useEffect(() => {
    getGoalNames();
  });

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <UserContext.Consumer>
              {user => (
                <Login
                  apiToken={user.apiToken}
                  loginSubmitted={login => {
                    const token = login.apiToken;
                    user.setApiToken(token);
                    handleLoginAttempt(token);
                  }}
                ></Login>
              )}
            </UserContext.Consumer>
          }
        />
        <Route path="/year" element={<Year client={client}></Year>}></Route>
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
