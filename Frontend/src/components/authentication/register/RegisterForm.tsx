import * as Yup from 'yup';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useFormik, Form, FormikProvider } from 'formik';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Stack,
    TextField,
    IconButton,
    InputAdornment,
    MenuItem,
    Link as MuiLink
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import API from '@/setting/endpoints';

interface Role {
    _id: string;
    name: string;
}

export interface RegisterUser {
    username: string;
    password: string;
    role_id: string | null;
}

interface RegisterFormProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

const RegisterForm = ({ onSuccess, onError }: RegisterFormProps): JSX.Element => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [roleError, setRoleError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await API.roles.getAll();
                setRoles(response.data.data);
                setRoleError(null);
            } catch (error) {
                console.error('Error fetching roles:', error);
                const errorMessage =
                    (error as any).response?.data?.message || 'Failed to load roles';
                setRoleError(errorMessage);
                if (onError) {
                    onError(errorMessage);
                }
            } finally {
                setLoadingRoles(false);
            }
        };
        fetchRoles();
    }, [onError]);

    const RegisterSchema = Yup.object().shape({
        username: Yup.string()
            .min(3, 'Username must be at least 3 characters')
            .max(50, 'Username must be less than 50 characters')
            .required('Username is required'),
        password: Yup.string()
            .min(3, 'Password must be at least 3 characters')
            .required('Password is required'),
        role_id: Yup.string().nullable()
    });

    const formik = useFormik<RegisterUser>({
        initialValues: {
            username: '',
            password: '',
            role_id: null
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const payload: RegisterUser = {
                    username: values.username.toLowerCase(),
                    password: values.password,
                    role_id: values.role_id
                };
                await API.users.create(payload);
                resetForm();

                if (onSuccess) {
                    onSuccess();
                }

                navigate('/login');
            } catch (error: any) {
                console.error('Registration error:', error);
                const errorMessage = error.response?.data?.message || 'Registration failed';
                if (onError) {
                    onError(errorMessage);
                }
            } finally {
                setSubmitting(false);
            }
        }
    });

    const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

    return (
        <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    <TextField
                        fullWidth
                        autoComplete="username"
                        type="text"
                        label="Username"
                        {...getFieldProps('username')}
                        error={Boolean(touched.username && errors.username)}
                        helperText={touched.username && errors.username}
                    />

                    <TextField
                        fullWidth
                        autoComplete="current-password"
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        {...getFieldProps('password')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        edge="end"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                    >
                                        <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        error={Boolean(touched.password && errors.password)}
                        helperText={touched.password && errors.password}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Role (optional)"
                        {...getFieldProps('role_id')}
                        error={Boolean(touched.role_id && errors.role_id) || Boolean(roleError)}
                        helperText={
                            (touched.role_id && errors.role_id) ||
                            (roleError ? roleError : 'Select a role (optional)')
                        }
                        disabled={loadingRoles}
                        value={formik.values.role_id || ''}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {roles.map((role) => (
                            <MenuItem key={role._id} value={role._id}>
                                {role.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <LoadingButton
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                    >
                        Register
                    </LoadingButton>
                </Stack>
            </Form>
        </FormikProvider>
    );
};

export default RegisterForm;
