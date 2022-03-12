import "./Login.scss";
import { FormEvent, useState } from "react";
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
  };

  return (
    <div className="Login">
      <form onSubmit={event => handleSubmit(event)}>
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
