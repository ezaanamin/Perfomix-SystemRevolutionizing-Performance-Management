import React, { createContext, useState } from 'react';
export const UserContext = createContext();


export function UserContextProvider({ children }) {
 
  const [Role, SetRole] = useState("");
  const [Modal,SetModal]=useState(false)
    const [open, setOpen] = useState(false);
      const [userInfo, setUserInfo] = useState({ Name: "", Role: "" });
    
  
  const userContextValue = {
    Role, SetRole,
    Modal,SetModal,
    open, setOpen,
    userInfo,
    setUserInfo

  };

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  );
}