import React from "react";
import { getJsonKey, getStringKey, storeStringKey } from "../utils/local-storage";


type User = {
  apiToken: string,
  setApiToken: (token: string) => void
}

const defaultUser: User = {
  apiToken: getStringKey('apiToken'),
  setApiToken: (token: string) => storeStringKey('apiToken', token),
};

const UserContext = React.createContext<User>(getJsonKey('User') ?? defaultUser);

export default UserContext;