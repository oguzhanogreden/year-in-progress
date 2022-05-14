import { catchError, map, OperatorFunction } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { AppGoal, User } from "../contexts/user-context";

type Error = { errors?: any }

function isError(e: any): e is Error {
  return 'errors' in e;
}

type Dto = UserDto | GoalDto;

type UserDto = Response & {
  username: string
  goals: string[];
}

declare type DataPointResponse = {
  timestamp: number;
  value: number;
};
export declare type GoalDto = {
  slug: string;
  rate: number;
  runits: GoalRateUnits;
  title: string;
  gunits: string;
  datapoints: DataPointResponse[];
};

export declare type GoalRateUnits = "y" | "m" | "w" | "d" | "h";


function throwResponseErrors<T>(): OperatorFunction<T | Error, T> {
  return map(response => {
    console.log(response);
    if (isError(response)) {
      throw response.errors;
    }

    return response;

  })
};

export function fetchUser(token: string) {
  const url = `https://www.beeminder.com/api/v1/users/me.json?auth_token=${token}`;

  return fromFetch<UserDto | Error>(url, { selector: response => response.json() }).pipe(
    throwResponseErrors<UserDto>(),
    map(x => {
      const user: User = {
        apiToken: token,
        goals: x.goals.sort().map(g => ({ slug: g } as AppGoal))
      }

      return user;
    }),
    catchError(error => {
      console.error("Beeminder", "fetchUser", error);

      throw error;
    }));
}

export function fetchGoal(token: string, slug: string) {
  const url = `https://www.beeminder.com/api/v1/users/me/goals/${slug}?auth_token=${token}&datapoints=true`;

  return fromFetch<GoalDto | Error>(url, { selector: response => response.json() }).pipe(
    throwResponseErrors<GoalDto>(),
    map(response => {
      const goal: AppGoal = {
        slug: slug,
        dataPoints: response.datapoints
      }

      return goal
    }),
    catchError(error => {
      console.error("Beeminder", "fetchGoal", error);

      throw error;
    })
  )
}