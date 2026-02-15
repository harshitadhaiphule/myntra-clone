import React, { createContext, useEffect, useState, useContext } from "react";
import { saveItem, getItem, deleteItem } from "../utils/storage";
import { API } from "../utils/api";
import { registerForPushNotifications } from "../utils/notifications"; 

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        //  ADDED: register push notification when user restored
        if (parsedUser?._id) {
          registerForPushNotifications(parsedUser._id);
        }
      }
    };
    loadUser();
  }, []);

  // ADDED: register push notification when user logs in/signup
  useEffect(() => {
    if (user?._id) {
      registerForPushNotifications(user._id);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const response = await API.post("/user/login", { email, password });
    const { user, token } = response.data;

    const userData = { ...user, token };
    setUser(userData);
    await saveItem("user", JSON.stringify(userData));
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await API.post("/user/signup", { name, email, password });
    const { user, token } = response.data;

    const userData = { ...user, token };
    setUser(userData);
    await saveItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await deleteItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/* import React, { createContext, useEffect, useState, useContext } from "react";
import { saveItem, getItem, deleteItem } from "../utils/storage";
import { API } from "../utils/api";

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);


  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await API.post("/user/login", { email, password });
    const { user, token } = response.data;

    const userData = { ...user, token };
    setUser(userData);
    await saveItem("user", JSON.stringify(userData));
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await API.post("/user/signup", { name, email, password });
    const { user, token } = response.data;

    const userData = { ...user, token };
    setUser(userData);
    await saveItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await deleteItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


 */