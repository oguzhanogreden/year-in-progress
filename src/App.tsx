import "./App.scss";
import "./Indicator.css";
import "./Canvas.css";
import "./Header.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import { GoalResponse, UserResponse } from "reactive-beeminder-client/dist/api";
import { Client, IClient } from "reactive-beeminder-client/dist/client";
import Settings from "./Settings";
import { getStringKey, storeStringKey } from "./utils/local-storage";
import Login from "./Login";
import { Target } from "./contexts/user-context";
import Year from "./pages/year/Year";
import { useEffect, useState } from "react";

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
  token: getStringKey("apiToken") ?? "",
  client: beeminderFetchClient,
});
client.setToken(getStringKey("apiToken") ?? "");

function App() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // TODO: Implement
  const [apiToken, setApiToken] = useState(getStringKey("apiToken") ?? "");

  useEffect(() => {
    if (!!apiToken) {
      storeStringKey("apiToken", apiToken);
    }
  }, [apiToken]);

  function handleLoggedInWithKey(apiKey: string) {
    setApiToken(apiKey);

    navigate("/year");
  }

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <Login
              apiToken={apiToken}
              client={client}
              loggedInWithApiKey={login =>
                handleLoggedInWithKey(login.apiToken)
              }
            ></Login>
          }
        />
        <Route path="/year" element={<Year client={client}></Year>}></Route>
        <Route
          path="/settings"
          element={
            <Settings
              onBeeminderApiKeyChanged={apiToken => setApiToken(apiToken)}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
