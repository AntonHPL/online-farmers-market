import { createContext, useEffect, useState, FC, ReactNode } from "react";
import axios from "axios";
import { UserContextInterface, UserType } from "../types";

const emptyFunction = (): void => { };
const defaultUserContext: UserContextInterface = {
    user: { _id: "", name: "", email: "", image: { data: "" } },
    setUser: emptyFunction,
    logInDialog: { open: false },
    setLogInDialog: emptyFunction,
    setTokenValidation: emptyFunction,
    isAccountImageChanged: false,
    setIsAccountImageChanged: emptyFunction,
    isTokenValidationComplete: false,
}
export const UserContext = createContext<UserContextInterface>(defaultUserContext);
export const WithUserContext: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [tokenValidation, setTokenValidation] = useState(true);
    const [logInDialog, setLogInDialog] = useState({ open: false });
    const [isAccountImageChanged, setIsAccountImageChanged] = useState(false);
    const [isTokenValidationComplete, setIsTokenValidationComplete] = useState(false);

    useEffect(() => {
        tokenValidation &&
            axios
                .get("/api/validate-token")
                .then(({ data }) => {
                    if (data.user) {
                        axios
                            .get(`/api/user/${data.user.id}`)
                            .then(res => {
                                setUser(res.data[0]);
                                setIsTokenValidationComplete(true);
                            })
                    } else {
                        setLogInDialog({ open: true });
                        setIsTokenValidationComplete(true);
                    }
                })
                .catch(error => console.error(error));
    }, [tokenValidation, isAccountImageChanged]);

    const value = {
        user,
        setUser,
        logInDialog,
        setLogInDialog,
        setTokenValidation,
        isAccountImageChanged,
        setIsAccountImageChanged,
        isTokenValidationComplete,
    }
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
};