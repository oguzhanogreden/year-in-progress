import React from "react";
import { getStringKey } from "../utils/local-storage";

export type Target = {
  // name: string;
  target: number;
};

type GoalDataPoint = {
  timestamp: number;
  value: number;
};
export type AppGoal = {
  dataPoints: GoalDataPoint[];
  slug: string;
  target?: Target;
};


export type User = {
  apiToken: string,
  goals: AppGoal[]
}

const defaultUser: User = {
  apiToken: getStringKey('apiToken') ?? '',
  goals: []
};

const UserContext = React.createContext<User>(defaultUser);

export default UserContext;