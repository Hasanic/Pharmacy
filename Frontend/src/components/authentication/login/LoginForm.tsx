import * as Yup from 'yup';
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import {
    Link,
    Stack,
    Checkbox,
    TextField,
    IconButton,
    InputAdornment,
    FormControlLabel
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import API from '@/setting/endpoints';
import { setAuthToken } from '@/setting/utils/tokenUtils';
import { LoginPayload } from '@/setting/types/authTypes';

interface LoginResponse {
    token: string;
    user: any;
}

interface LoginFormProps {
    setAuth: React.Dispatch<React.SetStateAction<LoginPayload>>;
    auth: LoginPayload;
    onSuccess?: (response: LoginResponse) => void;
    onError?: (error: any) => void;
}

const LoginForm = ({ setAuth, auth, onSuccess, onError }: LoginFormProps): JSX.Element => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);

    const LoginSchema = Yup.object().shape({
        username: Yup.string().required('Username is required'),
        password: Yup.string().required('Password is required')
    });

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
            remember: true
        },
        validationSchema: LoginSchema,
        onSubmit: async () => {
            try {
                setLoading(true);
                const response = await API.auth.login(auth);
                setAuthToken(response.data.token, formik.values.remember);

                if (onSuccess) {
                    onSuccess(response.data);
                }

                navigate('/dashboard', { replace: true });
            } catch (err: any) {
                console.error('Login failed:', err);
                if (onError) {
                    onError(err);
                }
            } finally {
                setLoading(false);
            }
        }
    });

    const { errors, touched, values, handleSubmit, getFieldProps } = formik;

    const handleShowPassword = () => {
        setShowPassword((show) => !show);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        formik.handleChange(e);
        const { name, value } = e.target;
        setAuth((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    <TextField
                        fullWidth
                        autoComplete="username"
                        type="text"
                        label="Username"
                        name="username"
                        onChange={handleChange}
                        value={values.username}
                        error={Boolean(touched.username && errors.username)}
                        helperText={touched.username && errors.username}
                    />

                    <TextField
                        fullWidth
                        autoComplete="current-password"
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        name="password"
                        onChange={handleChange}
                        value={values.password}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleShowPassword} edge="end">
                                        <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        error={Boolean(touched.password && errors.password)}
                        helperText={touched.password && errors.password}
                    />
                </Stack>

                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ my: 2 }}
                >
                    <FormControlLabel
                        control={
                            <Checkbox {...getFieldProps('remember')} checked={values.remember} />
                        }
                        label="Remember me"
                    />
                    <Link component={RouterLink} variant="subtitle2" to="#">
                        Forgot password?
                    </Link>
                </Stack>

                <LoadingButton
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    loading={loading}
                >
                    Login
                </LoadingButton>
            </Form>
        </FormikProvider>
    );
};

export default LoginForm;
