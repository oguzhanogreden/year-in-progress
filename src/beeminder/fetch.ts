import { catchError, map } from "rxjs";
import { fromFetch } from "rxjs/fetch";

function fetchUser(token: string) {
  const url = `https://www.beeminder.com/api/v1/users/me.json?auth_token=${token}`;

  return fromFetch(url, { selector: response => response.json() }).pipe(
    map(response => {
      if ('errors' in response) {
        throw response.errors;
      }

      return response;
    }),
    catchError(error => {
      console.error("Beeminder", "fetchUser", error);

      throw error;
    }));
}

export default fetchUser