import { createContext, useEffect, useState, FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContextInterface, UserType } from "../types";

const emptyFunction = (): void => { };
const defaultUserContext: UserContextInterface = {
    user: { id: "", email: "", name: "" },
    setUser: emptyFunction,
    logInDialog: { open: false },
    setLogInDialog: emptyFunction,
    setTokenValidation: emptyFunction,
}
export const UserContext = createContext<UserContextInterface>(defaultUserContext);
export const WithUserContext: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType>(null);
    const [tokenValidation, setTokenValidation] = useState(true);
    const navigate = useNavigate();
    const [logInDialog, setLogInDialog] = useState({ open: false });
    useEffect(() => {
        tokenValidation && axios.get("/api/validate-token")
            .then(({ data }) => { data.user ? setUser(data.user) : setLogInDialog({ open: true }) })
            .catch(error => console.log(error));
    }, [tokenValidation]);

    const value = {
        user,
        setUser,
        logInDialog,
        setLogInDialog,
        setTokenValidation
    }
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
};