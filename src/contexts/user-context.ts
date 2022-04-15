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
  addOrUpdateGoal: (goal: AppGoal) => void;

  goalSlugs: string[];
  setGoalSlugs: (slugs: string[]) => void;
}

const defaultUser: User = {
  apiToken: getStringKey('apiToken'),
  setApiToken: (token: string) => storeStringKey('apiToken', token),

  goalSlugs: [],
  setGoalSlugs: function (slugs: string[]): void {
    this.goalSlugs = slugs;
  },

  goals: [],
  addOrUpdateGoal: function (goal: AppGoal) {
    const { slug } = goal;

    const current = this.goals.find(g => g.slug === slug);

    this.goals = [...this.goals.filter(g => g.slug !== slug), current ? { ...goal, target: current.target } : goal]

  }
};

const UserContext = React.createContext<User>(defaultUser);

export default UserContext;