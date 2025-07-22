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

interface ProductCategory {
    _id: string;
    name: string;
}

interface ProductSupplier {
    _id: string;
    name: string;
}

interface ProductResponse {
    _id: string;
    name: string;
    category_id: string | ProductCategory;
    supplier_id: string | ProductSupplier;
    price: number;
    unit: string;
    stock_quantity?: number;
    expiry_date?: string | Date | null;
    description?: string;
    type?: string;
    image?: string | null;
    user_id?: string | null;
    unique_id?: number;
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

    const extractFilenameFromPath = (path: string): string | null => {
        try {
            return path.split(/[\\/]/).pop() || null;
        } catch {
            return null;
        }
    };

    const buildProductImageUrl = (filename: string): string => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        return `${baseUrl.replace(/\/api$/, '')}/api/medicines/image/${encodeURIComponent(
            filename
        )}`;
    };

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
            image: ''
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
                .required('Type is required'),
            image: Yup.string().nullable()
        }),
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                const formData = new FormData();
                Object.entries(values).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        formData.append(key, value.toString());
                    }
                });

                if (selectedFile) {
                    formData.append('imageFile', selectedFile);
                }

                if (isEdit && id) {
                    await API.products.update(id, formData as unknown as CreateProductPayload);
                    enqueueSnackbar('Product updated!', { variant: 'success' });
                } else {
                    await API.products.create(formData as unknown as CreateProductPayload);
                    enqueueSnackbar('Product created!', { variant: 'success' });
                }
                navigate('/dashboard/products');
            } catch (error) {
                console.error('Error:', error);
                enqueueSnackbar('Operation failed!', { variant: 'error' });
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoriesRes, suppliersRes] = await Promise.all([
                    API.categories.getAll(1),
                    API.suppliers.getAll(1)
                ]);

                setCategories(categoriesRes.data.data);
                setSuppliers(suppliersRes.data.data);
                setIsLoading((prev) => ({ ...prev, categories: false, suppliers: false }));

                if (isEdit && id) {
                    try {
                        const productRes = await API.products.getById(id);
                        const product = productRes.data as ProductResponse;

                        // Type-safe extraction of category ID
                        const categoryId =
                            typeof product.category_id === 'object'
                                ? (product.category_id as ProductCategory)._id
                                : product.category_id || '';

                        // Type-safe extraction of supplier ID
                        const supplierId =
                            typeof product.supplier_id === 'object'
                                ? (product.supplier_id as ProductSupplier)._id
                                : product.supplier_id || '';

                        // Ensure product type is valid
                        const productType = productTypes.some((pt) => pt.value === product.type)
                            ? (product.type as ProductType)
                            : 'Tablet';

                        const initialValues: FormValues = {
                            name: product.name || '',
                            category_id: categoryId,
                            supplier_id: supplierId,
                            price: product.price || 0,
                            unit: product.unit || '',
                            stock_quantity: product.stock_quantity || 0,
                            expiry_date: product.expiry_date
                                ? new Date(product.expiry_date).toISOString().split('T')[0]
                                : '',
                            description: product.description || '',
                            type: productType,
                            image: product.image || ''
                        };

                        formik.setValues(initialValues);

                        if (product.image) {
                            const filename = extractFilenameFromPath(product.image);
                            if (filename) {
                                setPreview(buildProductImageUrl(filename));
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching product:', error);
                        enqueueSnackbar('Failed to load product', { variant: 'error' });
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
            formik.setFieldValue('image', file.name);

            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading.product) {
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
                <Typography sx={{ ml: 2 }}>Loading product data...</Typography>
            </Box>
        );
    }

    return (
        <RootStyle title={isEdit ? 'Edit Product' : 'Create Product'}>
            <Container>
                <ContentStyle>
                    <Typography variant="h4" gutterBottom sx={{ mb: 5, textAlign: 'center' }}>
                        {isEdit ? 'Edit Product' : 'Create New Product'}
                    </Typography>

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
                            select
                            fullWidth
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
                                Product Image
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
                                'Update Product'
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
