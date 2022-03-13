import "./Login.scss";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { getStringKey } from "./local-storage";

export type UserLogin = {
  apiToken: string;
};

type LoginProps = {
  loginSubmitted: (l: UserLogin) => void;
};

const Login = (props: LoginProps) => {
  const [apiToken, setApiToken] = useState(getStringKey("apiToken"));

  const handleSubmit = (value: FormEvent<HTMLFormElement>) => {
    props.loginSubmitted({
      apiToken,
    });
    value.preventDefault();
    console.log("handleSubmit over.");
  };

  return (
    <div className="Login">
      <div>
        <h1>Welcome!</h1>

        <p>
          <em>year-in-progress</em> is a yearly goal tracker for Beeminder
          users.{" "}
        </p>

        <p>
          <Link to="/tour">Take the tour</Link> to explore the app, or{" "}
          <a
            href="https://help.beeminder.com/article/110-authorized-applications"
            target="_blank"
          >
            enter your Beeminder API token
          </a>{" "}
          to start :rocket:
        </p>
      </div>

      <form onSubmit={event => handleSubmit(event)}>
        <label>Beeminder API token</label>
        <input
          value={apiToken}
          onChange={event => {
            console.log("onChange - token");
            setApiToken(event.target.value);
          }}
        ></input>

        <button type="submit">Get started!</button>
      </form>
    </div>
  );
};

export default Login;
