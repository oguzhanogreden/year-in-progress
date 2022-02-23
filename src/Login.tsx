import { FormEvent, useState } from "react";
import { getStringKey } from "./local-storage";

export type UserLogin = {
  username: string;
  apiToken: string;
};

type LoginProps = {
  userLoggedIn: (l: UserLogin) => void;
};

const Login = (props: LoginProps) => {
  const [username, setUsername] = useState("");
  const [apiToken, setApiToken] = useState(getStringKey("apiToken"));

  const handleSubmit = (value: FormEvent<HTMLFormElement>) => {
    props.userLoggedIn({
      username,
      apiToken,
    });
    value.preventDefault();
  };

  return (
    <div className="Login">
      <form onSubmit={event => handleSubmit(event)}>
        <label>
          username
          <input
            value={username}
            onChange={event => setUsername(event.target.value)}
          ></input>
        </label>

        <label>
          api token
          <input
            value={apiToken}
            onChange={event => setApiToken(event.target.value)}
          ></input>
        </label>

        <button type="submit"> Submit</button>
      </form>
    </div>
  );
};

export default Login;
