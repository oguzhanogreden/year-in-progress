import {
  groupBy,
  map,
  mergeMap, ReplaySubject, scan, shareReplay,
  Subject,
  tap
} from "rxjs";

// var _beeminder = require("beeminder");

export type Goal = {
  slug: string;
  rate: GoalRate;
  title: string;
  category?: string;
  dataPoints: {
    timestamp: number,
    value: number,
  }[]
};

export type GoalRate = {
  value: number;
  unit: GoalRateUnits;
  gunit: string;
};

export type GoalRateUnits = "y" | "m" | "w" | "d" | "h";

export type User = {
  goals: string[];
};

export class Client {
  private _client: IClient;
  private _userDataStream = new Subject<User>();
  private _goalDataStream = new ReplaySubject<GoalResponse>();

  userDataStream$ = this._userDataStream.pipe(shareReplay(1));
  goalDataStream$ = this._goalDataStream.pipe(
    map((response) => {
      const title = response.title;

      return {
        rate: {
          value: response.rate,
          unit: response.runits,
          gunit: response.gunits,
        },
        slug: response.slug,
        title: title,
        category: categorizeGoal(title, categories),
        dataPoints: response.datapoints
      } as Goal;
    }),
    shareReplay(1)
  );

  constructor(token: string, client: (token: string) => IClient ) {
    this._client = client(token);
    // this._client = _beeminder(token);
  }

  getGoalNames() {
    this._client.getUser(this.getGoalNamesCallback.bind(this));
  }

  getGoalData(slug: string) {
    this._client.getGoal(slug, this.getGoalDataCallback.bind(this));
  }

  filterByCategory(category: GoalCategory) {
    return this.goalDataStream$.pipe(
      groupBy((x) => x.category),
      mergeMap((group) => {
        return group.pipe(
          tap(x => console.log),
          scan((acc, cur) => [...acc, 1], [0]),
          tap(x => console.log),
          // scan((total, goal) => total + goal.rate.value, 0));
        )
        })
    )
  }

  private getGoalDataCallback(err: any, result: GoalResponse) {
    // TODO: Check if this is bound?

    // TODO: Should be in the reactive code?
    if (err) {
      throw new Error("Can't get goal.");
    }

    this._goalDataStream.next(result);
  }

  private getGoalNamesCallback(err: any, result: User) {
    // TODO: Check if this is bound?

    // TODO: Should be in the reactive code?
    if (err) {
      throw new Error("While getting data.");
    }

    this._userDataStream.next(result);
  }
}

export type Callback<T> = (err: any, result: T) => void;

export type IClient = {
  getUser: (cb: Callback<User>) => void;
  getGoal: (goalName: string, cb: Callback<GoalResponse>) => void;
};

type DataPointResponse = {
  timestamp: number;
  value: number;
};

export type GoalResponse = {
  slug: string;
  rate: number;
  runits: GoalRateUnits;
  title: string;
  gunits: string;
  datapoints: DataPointResponse[];
};

type GoalCategory = {
  titleContains: string;
  name: string;
};

const categories: GoalCategory[] = [
  {
    titleContains: "🎯🤓🧑🏽‍💻⏲⬆️",
    name: "/d",
  },
  {
    titleContains: "🎯🐝🚀⏲⬆️",
    name: "/pb-i-p",
  },
  {
    titleContains: "🎯🐝🎧⏲⬆️",
    name: "/pb-push",
  },
];

function categorizeGoal(title: string, categories: GoalCategory[]): string {
  const categoryMarkers = categories.map((x) => x.titleContains);

  return categories[categoryMarkers.indexOf(title)]?.name;
}