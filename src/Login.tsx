import "./Login.scss";
import { FormEvent, useEffect, useState } from "react";
import { Client } from "reactive-beeminder-client/dist/client";
import { timeout, finalize, catchError, EMPTY, Subject, takeUntil } from "rxjs";
import { FiLoader } from "react-icons/fi";
import Button from "./Button";
import { fetchUser } from "./beeminder/fetch";
import Input from "./Input";

export type UserLogin = {
  apiToken: string;
};

type LoginProps = {
  apiToken: string;
  client: Client;
  loggedInWithApiKey: (l: UserLogin) => void;
};

const Login = (props: LoginProps) => {
  const [apiToken, setApiToken] = useState(props.apiToken);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const takeUntilEffect = new Subject();
  const handleSubmit = (value: FormEvent<HTMLFormElement>) => {
    setIsLoading(true);

    fetchUser(apiToken)
      .pipe(
        takeUntil(takeUntilEffect),
        catchError(err => {
          return EMPTY;
        }),
        timeout(2000),
        finalize(() => setIsLoading(false))
      )
      .subscribe({
        next: _ => setIsLoggedIn(true),
        error: () => console.error("Request taking too long."),
      });

    value.preventDefault(); // Prevent HTML form submission
  };

  useEffect(() => {
    if (isLoggedIn) {
      takeUntilEffect.next(null);

      props.loggedInWithApiKey({ apiToken });
    }
  }, [isLoggedIn]);

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
        <Input
          label={<label>Beeminder API token</label>}
          input={
            <input
              type="password"
              value={apiToken}
              onChange={event => {
                setApiToken(event.target.value);
              }}
            ></input>
          }
        ></Input>

        <Button
          button={
            <button type="submit" disabled={isLoading}>
              {isLoading ? <FiLoader></FiLoader> : "Get started!"}
            </button>
          }
        ></Button>
      </form>
    </div>
  );
};

export default Login;
