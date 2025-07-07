"use client"

import { useSession} from 'next-auth/react';
import React, { createContext, useState, useEffect } from 'react'

export const UserContext = createContext();

export const UserContextProvider = ({children}) => {

    const [user, setUser] = useState()
    const [portfolioStats, setPortfolioStats] = useState()

    const {data} = useSession()

    useEffect(() => {
      const fetchId = async () => {
        if (data?.user?.email) {
          try {
            const response = await fetch(`/api/userId?mail=${data.user.email}`);
            const result = await response.json();
            console.log("fetched user: ", result)
  
            setUser(result);
          } catch (error) {
            console.error("Error fetching user ID:", error);
          }
        }
      };

      const fetchPortfolioStats = async () => {
        if (data?.user?.email) {
          try {
            const response = await fetch(`http://127.0.0.1:5000/api/portfolio?mail=${data.user.email}`);
            const result = await response.json();
            console.log("portfolio: ", result)
  
            setPortfolioStats(result);
          } catch (error) {
            console.error(error);
          }
        }
      };

      fetchId();
      fetchPortfolioStats();
    }, [data?.user?.email, setUser]);

  return (
    <UserContext.Provider value={{user, setUser, portfolioStats, setPortfolioStats}}>
        {children}
    </UserContext.Provider>
  )
}