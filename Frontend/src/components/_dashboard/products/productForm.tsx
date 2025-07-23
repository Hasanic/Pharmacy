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
import { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

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

type ProductType = 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Other';

interface Product {
    _id: string;
    name: string;
    category_id: string | { _id: string; name: string };
    supplier_id: string | { _id: string; name: string };
    price: number;
    unit: string;
    stock_quantity?: number;
    expiry_date?: string | Date | null;
    description?: string;
    type?: string;
    image?: string | null;
    user_id?: string | null;
}

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
    image?: File | string | null;
}

const ProductForm = (): JSX.Element => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState({
        categories: true,
        suppliers: true,
        product: isEdit
    });

    const productTypes: { value: ProductType; label: string }[] = [
        { value: 'Tablet', label: 'Tablet' },
        { value: 'Capsule', label: 'Capsule' },
        { value: 'Syrup', label: 'Syrup' },
        { value: 'Injection', label: 'Injection' },
        { value: 'Other', label: 'Other' }
    ];

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
            type: 'Tablet',
            image: null
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().required('Product name is required'),
            category_id: Yup.string().required('Category is required'),
            supplier_id: Yup.string().required('Supplier is required'),
            price: Yup.number().required('Price is required').min(0),
            unit: Yup.string().required('Unit is required'),
            stock_quantity: Yup.number().min(0),
            expiry_date: Yup.date().nullable(),
            description: Yup.string().nullable(),
            type: Yup.mixed<ProductType>()
                .oneOf(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Other'])
                .required('Type is required')
        }),
        onSubmit: async (values) => {
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

                if (values.expiry_date) formData.append('expiry_date', values.expiry_date);
                if (values.description) formData.append('description', values.description);

                if (selectedFile instanceof File) {
                    formData.append('image', selectedFile);
                } else if (isEdit && typeof values.image === 'string') {
                    formData.append('image', values.image);
                }

                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                };

                if (isEdit && id) {
                    await API.products.update(id, formData, config);
                    enqueueSnackbar('Medicine updated successfully!', { variant: 'success' });
                } else {
                    await API.products.create(formData, config);
                    enqueueSnackbar('Medicine created successfully!', { variant: 'success' });
                }
                navigate('/dashboard/Medicine');
            } catch (error) {
                console.error('Error:', error);
                if (error instanceof AxiosError) {
                    if (error.response) {
                        const errorMessage = error.response.data?.message || 'Operation failed!';
                        enqueueSnackbar(errorMessage, { variant: 'error' });
                    } else {
                        enqueueSnackbar('Request failed', { variant: 'error' });
                    }
                } else {
                    enqueueSnackbar('An unexpected error occurred', { variant: 'error' });
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoriesRes, suppliersRes] = await Promise.all([
                    API.categories.getAll(),
                    API.suppliers.getAll()
                ]);

                setCategories(categoriesRes.data.data);
                setSuppliers(suppliersRes.data.data);
                setIsLoading((prev) => ({ ...prev, categories: false, suppliers: false }));

                if (isEdit && id) {
                    try {
                        const productRes = await API.products.getById(id);
                        const product = productRes.data as Product;

                        const initialValues = {
                            name: product.name,
                            category_id:
                                typeof product.category_id === 'object'
                                    ? product.category_id._id
                                    : product.category_id,
                            supplier_id:
                                typeof product.supplier_id === 'object'
                                    ? product.supplier_id._id
                                    : product.supplier_id,
                            price: product.price,
                            unit: product.unit,
                            stock_quantity: product.stock_quantity || 0,
                            expiry_date: product.expiry_date
                                ? new Date(product.expiry_date).toISOString().split('T')[0]
                                : '',
                            description: product.description || '',
                            type: (product.type as ProductType) || 'Tablet',
                            image: product.image || null
                        };

                        formik.resetForm({ values: initialValues });

                        if (product.image) {
                            const imgBaseUrl =
                                import.meta.env.VITE_API_URL?.replace(/\/api$/, '') ||
                                'http://localhost:8000';
                            setPreview(`${imgBaseUrl}/uploads/${product.image}`);
                        }
                    } catch (error) {
                        console.error('Error fetching Medicine:', error);
                        enqueueSnackbar('Failed to load Medicine data', { variant: 'error' });
                    } finally {
                        setIsLoading((prev) => ({ ...prev, product: false }));
                    }
                }
            } catch (error) {
                console.error('Initial data fetch error:', error);
                enqueueSnackbar('Failed to load required data', { variant: 'error' });
                setIsLoading({
                    categories: false,
                    suppliers: false,
                    product: false
                });
            }
        };

        fetchInitialData();
    }, [id, isEdit]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            formik.setFieldValue('image', file);

            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading.product || isLoading.categories || isLoading.suppliers) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading data...</Typography>
            </Box>
        );
    }

    return (
        <RootStyle title={isEdit ? 'Edit  Medicine' : 'Create Medicine'}>
            <Container>
                <ContentStyle>
                    <Typography variant="h4" gutterBottom sx={{ mb: 5, textAlign: 'center' }}>
                        {isEdit ? 'Edit  Medicine' : 'Create New Medicine'}
                    </Typography>

                    <FormStyle onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            label="Medicine Name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Medicine Type"
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
                            select
                            fullWidth
                            label="Category"
                            name="category_id"
                            value={formik.values.category_id || ''}
                            onChange={formik.handleChange}
                            disabled={isLoading.categories}
                            error={formik.touched.category_id && Boolean(formik.errors.category_id)}
                            helperText={formik.touched.category_id && formik.errors.category_id}
                        >
                            <MenuItem value="">Select Category</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Supplier"
                            name="supplier_id"
                            value={formik.values.supplier_id || ''}
                            onChange={formik.handleChange}
                            disabled={isLoading.suppliers}
                            error={formik.touched.supplier_id && Boolean(formik.errors.supplier_id)}
                            helperText={formik.touched.supplier_id && formik.errors.supplier_id}
                        >
                            <MenuItem value="">Select Supplier</MenuItem>
                            {suppliers.map((supplier) => (
                                <MenuItem key={supplier._id} value={supplier._id}>
                                    {supplier.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            type="number"
                            label="Price"
                            name="price"
                            value={formik.values.price}
                            onChange={formik.handleChange}
                            InputProps={{ inputProps: { min: 0 } }}
                            error={formik.touched.price && Boolean(formik.errors.price)}
                            helperText={formik.touched.price && formik.errors.price}
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
                            type="number"
                            label="Stock Quantity"
                            name="stock_quantity"
                            value={formik.values.stock_quantity}
                            onChange={formik.handleChange}
                            InputProps={{ inputProps: { min: 0 } }}
                            error={
                                formik.touched.stock_quantity &&
                                Boolean(formik.errors.stock_quantity)
                            }
                            helperText={
                                formik.touched.stock_quantity && formik.errors.stock_quantity
                            }
                        />

                        <TextField
                            fullWidth
                            type="date"
                            label="Expiry Date"
                            name="expiry_date"
                            value={formik.values.expiry_date}
                            onChange={formik.handleChange}
                            InputLabelProps={{ shrink: true }}
                            error={formik.touched.expiry_date && Boolean(formik.errors.expiry_date)}
                            helperText={formik.touched.expiry_date && formik.errors.expiry_date}
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                            helperText={formik.touched.description && formik.errors.description}
                        />

                        <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Medicine Image
                            </Typography>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'block', marginBottom: 16 }}
                            />
                            {preview && (
                                <Avatar
                                    src={preview}
                                    alt="Preview"
                                    sx={{ width: 150, height: 150 }}
                                    variant="rounded"
                                />
                            )}
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={isSubmitting}
                            sx={{ mt: 3 }}
                        >
                            {isSubmitting ? (
                                <CircularProgress size={24} />
                            ) : isEdit ? (
                                'Update Medicine'
                            ) : (
                                'Create Medicine'
                            )}
                        </Button>
                    </FormStyle>
                </ContentStyle>
            </Container>
        </RootStyle>
    );
};

export default ProductForm;
