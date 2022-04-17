import React from "react";
import { getStringKey, storeStringKey } from "../utils/local-storage";

export type Target = {
  name: string;
  target: number;
};

export type AppGoal = {
  slug: string;
  target?: Target;
};


type User = {
  apiToken: string,
  setApiToken: (token: string) => void

  goals: AppGoal[];
  setGoals: (goal: AppGoal[]) => void;

  goalSlugs: string[];
  setGoalSlugs: (slugs: string[]) => void;
}

const defaultUser: User = {
  apiToken: getStringKey('apiToken'),
  setApiToken: (token: string) => storeStringKey('apiToken', token),

  goalSlugs: [],
  setGoalSlugs: function (slugs: string[]): void {
    console.log(slugs);
    this.goalSlugs = slugs;
  },

  goals: [],
  setGoals: function (goals: AppGoal[]) {
    this.goals = goals;
  }
};

const UserContext = React.createContext<User>(defaultUser);

export default UserContext;