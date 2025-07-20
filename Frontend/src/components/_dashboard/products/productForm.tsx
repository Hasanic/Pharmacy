import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';
import {
    Container,
    Typography,
    Stack,
    TextField,
    MenuItem,
    Button,
    Box,
    CircularProgress,
    Avatar
} from '@mui/material';
import Page from '@/components/Page';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import API from '@/setting/endpoints';
import { CreateProductPayload } from '@/setting/types/productTypes';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

const RootStyle = styled(Page)(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        display: 'flex'
    }
}));

const ContentStyle = styled('div')(({ theme }) => ({
    maxWidth: 800,
    margin: 'auto',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(12, 0)
}));

const FormStyle = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3)
}));

interface Category {
    _id: string;
    name: string;
}

interface Supplier {
    _id: string;
    name: string;
}

// type ProductType = 'Medicine' | 'Equipment' | 'Supplement' | 'Other';
type ProductType = 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Other';

interface FormValues {
    name: string;
    category_id: string;
    supplier_id: string;
    price: number;
    unit: string;
    stock_quantity: number;
    expiry_date: string;
    description: string;
    type: ProductType;
    image: string;
}

const ProductForm = (): JSX.Element => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState({
        categories: true,
        suppliers: true
    });

    const productTypes: { value: ProductType; label: string }[] = [
        // { value: 'Medicine', label: 'Medicine' },
        // { value: 'Equipment', label: 'Equipment' },
        // { value: 'Supplement', label: 'Supplement' },
        // { value: 'Other', label: 'Other' }
        { value: 'Tablet', label: 'Tablet' },
        { value: 'Capsule', label: 'Capsule' },
        { value: 'Syrup', label: 'Syrup' },
        { value: 'Injection', label: 'Injection' },
        { value: 'Other', label: 'Other' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesResponse, suppliersResponse] = await Promise.all([
                    API.categories.getAll(1),
                    API.suppliers.getAll(1)
                ]);

                setCategories(categoriesResponse.data.data);
                setSuppliers(suppliersResponse.data.data);
                setIsLoading({ categories: false, suppliers: false });
            } catch (error) {
                console.error('Error fetching data:', error);
                enqueueSnackbar('Failed to load categories or suppliers', {
                    variant: 'error',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right'
                    }
                });
                setIsLoading({ categories: false, suppliers: false });
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!selectedFile) {
            setPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const formik = useFormik<FormValues>({
        initialValues: {
            name: '',
            category_id: '',
            supplier_id: '',
            price: 0,
            unit: '',
            stock_quantity: 0,
            expiry_date: '',
            description: '',
            // type: 'Medicine',
            type: 'Tablet',
            image: ''
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().required('Product name is required'),
            category_id: Yup.string()
                .required('Category is required')
                .matches(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),
            supplier_id: Yup.string()
                .required('Supplier is required')
                .matches(/^[0-9a-fA-F]{24}$/, 'Invalid supplier ID format'),
            price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
            unit: Yup.string().required('Unit is required'),
            stock_quantity: Yup.number().min(0, 'Stock quantity cannot be negative'),
            expiry_date: Yup.date().nullable(),
            description: Yup.string().nullable(),
            type: Yup.mixed<ProductType>()
                .oneOf(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Other'])
                // .oneOf(['Medicine', 'Equipment', 'Supplement', 'Other'])
                .required('Type is required'),
            image: Yup.string().nullable()
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setIsSubmitting(true);
            try {
                const formData = new FormData();

                formData.append('name', values.name);
                formData.append('category_id', values.category_id);
                formData.append('supplier_id', values.supplier_id);
                formData.append('price', values.price.toString());
                formData.append('unit', values.unit);
                formData.append('stock_quantity', values.stock_quantity.toString());
                formData.append('type', values.type);

                if (values.expiry_date) {
                    formData.append('expiry_date', values.expiry_date);
                }
                if (values.description) {
                    formData.append('description', values.description);
                }
                if (selectedFile) {
                    formData.append('image', selectedFile);
                }

                await API.products.create(formData as unknown as CreateProductPayload);

                enqueueSnackbar('Product created successfully!', {
                    variant: 'success',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right'
                    },
                    autoHideDuration: 3000
                });

                resetForm();
                setSelectedFile(null);
                setPreview(null);
                navigate('/dashboard/products');
            } catch (error) {
                console.error('Error creating product:', error);
                let errorMessage = 'Failed to create product. Please try again.';

                if (error instanceof AxiosError) {
                    errorMessage = error.response?.data?.message || errorMessage;
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }

                enqueueSnackbar(errorMessage, {
                    variant: 'error',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right'
                    },
                    autoHideDuration: 5000
                });
            } finally {
                setSubmitting(false);
                setIsSubmitting(false);
            }
        }
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);
            formik.setFieldValue('image', file.name);
        }
    };

    return (
        <RootStyle title="Add Product">
            <Container>
                <ContentStyle>
                    <Stack sx={{ mb: 5 }}>
                        <Typography
                            variant="h4"
                            gutterBottom
                            align="center"
                            sx={{ fontWeight: 'bold' }}
                        >
                            Create Product
                        </Typography>
                    </Stack>

                    <FormStyle onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            label="Product Name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                        />

                        <TextField
                            fullWidth
                            select
                            label="Product Type"
                            name="type"
                            value={formik.values.type}
                            onChange={formik.handleChange}
                            error={formik.touched.type && Boolean(formik.errors.type)}
                            helperText={formik.touched.type && formik.errors.type}
                        >
                            {productTypes.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            select
                            label="Category"
                            name="category_id"
                            value={formik.values.category_id}
                            onChange={formik.handleChange}
                            error={formik.touched.category_id && Boolean(formik.errors.category_id)}
                            helperText={formik.touched.category_id && formik.errors.category_id}
                            disabled={isLoading.categories}
                            InputProps={{
                                endAdornment: isLoading.categories ? (
                                    <CircularProgress size={20} />
                                ) : null
                            }}
                        >
                            <MenuItem value="">Select a category</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            select
                            label="Supplier"
                            name="supplier_id"
                            value={formik.values.supplier_id}
                            onChange={formik.handleChange}
                            error={formik.touched.supplier_id && Boolean(formik.errors.supplier_id)}
                            helperText={formik.touched.supplier_id && formik.errors.supplier_id}
                            disabled={isLoading.suppliers}
                            InputProps={{
                                endAdornment: isLoading.suppliers ? (
                                    <CircularProgress size={20} />
                                ) : null
                            }}
                        >
                            <MenuItem value="">Select a supplier</MenuItem>
                            {suppliers.map((supplier) => (
                                <MenuItem key={supplier._id} value={supplier._id}>
                                    {supplier.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Price"
                            name="price"
                            type="number"
                            value={formik.values.price}
                            onChange={formik.handleChange}
                            error={formik.touched.price && Boolean(formik.errors.price)}
                            helperText={formik.touched.price && formik.errors.price}
                            InputProps={{
                                inputProps: { min: 0 }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Unit"
                            name="unit"
                            value={formik.values.unit}
                            onChange={formik.handleChange}
                            error={formik.touched.unit && Boolean(formik.errors.unit)}
                            helperText={formik.touched.unit && formik.errors.unit}
                        />

                        <TextField
                            fullWidth
                            label="Stock Quantity"
                            name="stock_quantity"
                            type="number"
                            value={formik.values.stock_quantity}
                            onChange={formik.handleChange}
                            error={
                                formik.touched.stock_quantity &&
                                Boolean(formik.errors.stock_quantity)
                            }
                            helperText={
                                formik.touched.stock_quantity && formik.errors.stock_quantity
                            }
                            InputProps={{
                                inputProps: { min: 0 }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Expiry Date"
                            name="expiry_date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={formik.values.expiry_date}
                            onChange={formik.handleChange}
                            error={formik.touched.expiry_date && Boolean(formik.errors.expiry_date)}
                            helperText={formik.touched.expiry_date && formik.errors.expiry_date}
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            multiline
                            rows={3}
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                            helperText={formik.touched.description && formik.errors.description}
                        />

                        <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Product Image
                            </Typography>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'block' }}
                            />
                            {selectedFile && (
                                <Box sx={{ mt: 2 }}>
                                    <Avatar
                                        src={preview || undefined}
                                        alt="Product preview"
                                        sx={{
                                            width: 150,
                                            height: 150,
                                            borderRadius: 1,
                                            border: '1px solid #ddd'
                                        }}
                                        variant="square"
                                    />
                                </Box>
                            )}
                        </Box>

                        <Button
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{ mt: 3 }}
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={24} sx={{ mr: 1 }} />
                                    Creating...
                                </>
                            ) : (
                                'Create Product'
                            )}
                        </Button>
                    </FormStyle>
                </ContentStyle>
            </Container>
        </RootStyle>
    );
};

export default ProductForm;
