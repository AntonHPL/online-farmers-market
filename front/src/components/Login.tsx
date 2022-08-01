import { useState, useContext, FC, FormEvent } from 'react';
import { Alert, Button, TextField, FormControlLabel, Checkbox, Dialog, DialogContent, Link } from '@mui/material';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import { EmptyInputsType } from "../types";

const Login: FC<{ setSignUpDialog: (signUpDialog: { open: boolean }) => void }> = ({ setSignUpDialog }) => {
    const emptyInputs: EmptyInputsType = {
        name: "",
        email: "",
        password: "",
    };
    const [inputs, setInputs] = useState<EmptyInputsType>(emptyInputs);
    const [checked, setChecked] = useState(true);
    const [cookieAge, setCookieAge] = useState<number | null>(7 * 3600 * 1000);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setTokenValidation, setLogInDialog: setDialog } = useContext(UserContext);

    const onSubmit = (e: FormEvent): void => {
        e.preventDefault();
        setTokenValidation(false);
        axios
            .post("/api/log-in", { email: inputs.email, password: inputs.password, cookieAge: cookieAge })
            .then(() => {
                setTokenValidation(true);
                setDialog({ open: false })
                navigate("/");
                setInputs(emptyInputs);
            })
            .catch(error => setError(error.response.data.message))
    };

    const handleCookieAge = (): void => {
        checked ? setCookieAge(null) : setCookieAge(7 * 3600 * 1000);
        setChecked(!checked);
    };

    return (
        <form
            onSubmit={onSubmit}
            encType="multipart/form-data"
        >
            <TextField
                required
                type="email"
                size="small"
                variant="outlined"
                value={inputs.email}
                autoComplete="off"
                placeholder="Enter your E-mail"
                onChange={e => {
                    error && setError("");
                    setInputs({ ...inputs, email: e.target.value })
                }}
                className="form_row"
            />
            <TextField
                required
                type="password"
                size="small"
                variant="outlined"
                value={inputs.password}
                autoComplete="off"
                placeholder="Enter the Password"
                onChange={e => {
                    error && setError("");
                    setInputs({ ...inputs, password: e.target.value })
                }}
                className="form_row"
            />
            <FormControlLabel
                control={<Checkbox checked={checked} />}
                label="Remember for 7 days."
                onChange={handleCookieAge}
            />
            {error &&
                <Alert
                    severity="error"
                    className="alert"
                >
                    {error}
                </Alert>
            }
            <Button
                type="submit"
                // onClick={saveAndPlace}
                // startIcon={<SaveIcon />}
                variant="contained"
                className="submitButton"
            >
                Continue
            </Button>
            <p className="prompt">
                Don't have an Account yet?&nbsp;
                <Link
                    onClick={() => setSignUpDialog({ open: true })}
                    underline="hover"
                    className="log-in_link"
                >
                    Sign up
                </Link>
            </p>
        </form>
    );
};

export default Login;