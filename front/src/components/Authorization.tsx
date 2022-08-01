import { useState, useContext, FC, MouseEvent } from 'react';
import { Button, TextField, Link } from '@mui/material';
import axios from "axios";
import Captcha from './Captcha';
import { UserContext } from "./UserContext";
import { InputsType } from "../types";

const Authorization: FC = () => {
    const [inputs, setInputs] = useState<InputsType>({
        name: "",
        email: "",
        password: "",
    });
    const [reenteredPassword, setReenteredPassword] = useState("");
    const [validationError, setValidationError] = useState(false);
    const [captchaValidation, setCaptchaValidation] = useState(false);
    const { setLogInDialog } = useContext(UserContext);

    const signUp = (e: MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setCaptchaValidation(true);
        inputs.password === reenteredPassword ?
            axios.post("/api/sign-up", { name: inputs.name, email: inputs.email, password: inputs.password }) :
            setValidationError(true);
    };

    return (
        <form
            // onSubmit={onSubmit}
            encType="multipart/form-data"
        >
            <TextField
                required
                type="text"
                size="small"
                variant="outlined"
                value={inputs.name}
                autoComplete="off"
                placeholder="Enter your Name"
                onChange={e => setInputs({ ...inputs, name: e.target.value })}
                className="form_row"
            />
            <TextField
                required
                type="email"
                size="small"
                variant="outlined"
                value={inputs.email}
                autoComplete="off"
                placeholder="Enter your E-mail"
                onChange={e => setInputs({ ...inputs, email: e.target.value })}
                className="form_row"
            />
            <TextField
                required
                type="password"
                size="small"
                variant="outlined"
                value={inputs.password}
                autoComplete="off"
                placeholder="Create a Password"
                onChange={e => setInputs({ ...inputs, password: e.target.value })}
                className="form_row"
            />
            <TextField
                required
                type="password"
                size="small"
                variant="outlined"
                value={reenteredPassword}
                autoComplete="off"
                placeholder="Confirm the Password"
                onChange={e => setReenteredPassword(e.target.value)}
                error={validationError}
                helperText={validationError && "The Passwords do not match."}
                className="form_row"
            />
            <Captcha validation={captchaValidation} />
            <Button
                type="submit"
                onClick={signUp}
                // startIcon={<SaveIcon />}
                variant="contained"
                className="submitButton"
            >
                Continue
            </Button>
            <p className="prompt">
                Already have an Account?&nbsp;
                <Link
                    onClick={() => setLogInDialog({ open: true })}
                    underline="hover"
                    className="log-in_link"
                >
                    Log in
                </Link>
            </p>
        </form>
    );
};

export default Authorization;