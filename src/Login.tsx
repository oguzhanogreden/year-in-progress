import "./Login.scss";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { getStringKey } from "./utils/local-storage";

export type UserLogin = {
  apiToken: string;
};

type LoginProps = {
  apiToken: string;
  loginSubmitted: (l: UserLogin) => void;
};

const Login = (props: LoginProps) => {
  const [apiToken, setApiToken] = useState(props.apiToken);

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
        <em>
          <strong>In development... </strong>
        </em>
        ⚙️
        <p>
          <em>year-in-progress</em>{" "}
          <span
            style={{
              textDecoration: "line-through",
            }}
          >
            is
          </span>{" "}
          will be a yearly goal tracker for Beeminder users.
        </p>
        <p>
          <a
            href="https://help.beeminder.com/article/110-authorized-applications"
            target="_blank"
          >
            <span style={{ textDecoration: "line-through" }}>enter</span> your
            Beeminder API token
          </a>{" "}
          to start 🚀
        </p>
      </div>

      <form onSubmit={event => handleSubmit(event)}>
        <label>Beeminder API token</label>
        <input
          type="password"
          value={apiToken}
          onChange={event => {
            setApiToken(event.target.value);
          }}
        ></input>

        <button type="submit">Get started!</button>
      </form>
    </div>
  );
};

export default Login;
