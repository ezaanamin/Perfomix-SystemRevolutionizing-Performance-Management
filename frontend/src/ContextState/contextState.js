import React, { createContext, useState } from 'react';
export const UserContext = createContext();


export function UserContextProvider({ children }) {
 

  const userContextValue = {
   
  };

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  );
}