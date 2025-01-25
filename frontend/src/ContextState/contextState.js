import React, { createContext, useState } from 'react';
export const UserContext = createContext();


export function UserContextProvider({ children }) {
 
  const [Role, SetRole] = useState("");
  const [Modal,SetModal]=useState(false)
  const userContextValue = {
    Role, SetRole,
    Modal,SetModal
  };

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  );
}