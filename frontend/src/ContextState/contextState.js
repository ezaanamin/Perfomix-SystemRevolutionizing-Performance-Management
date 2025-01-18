import React, { createContext, useState } from 'react';
export const UserContext = createContext();


export function UserContextProvider({ children }) {
 
  const [Role, SetRole] = useState("Staff");
  const userContextValue = {
    Role, SetRole
  };

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  );
}