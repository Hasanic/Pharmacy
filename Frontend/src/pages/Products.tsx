import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';
import { Container, Stack, Typography, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Page from '@/components/Page';
import { ProductList, ProductFilterSidebar } from '@/components/_dashboard/products';
import API from '@/setting/endpoints';
import { IProduct } from '@/models';

type ProductType = 'Medicine' | 'Equipment' | 'Supplement' | 'Other';

interface FilterValues {
    name: string;
    type: ProductType[];
    category: string;
    priceRange: [number, number];
    maxPrice: number;
}

interface APIProduct {
    _id: string;
    name: string;
    category_id: string | { _id: string; name: string };
    supplier_id: string | { _id: string; name: string };
    price: number;
    unit: string;
    stock_quantity?: number;
    expiry_date?: Date | null;
    description?: string;
    type?: ProductType;
    image?: string | null;
    user_id?: string | null;
    unique_id?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface APIResponse {
    data: {
        code: number;
        status: string;
        data?: APIProduct[];
        message?: string;
    };
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request?: any;
}

const EcommerceShop = (): JSX.Element => {
    const [openFilter, setOpenFilter] = useState(false);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [allProducts, setAllProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [maxPrice, setMaxPrice] = useState(1000);
    const navigate = useNavigate();

    const formik = useFormik<FilterValues>({
        initialValues: {
            name: '',
            type: [],
            category: '',
            priceRange: [0, 1000],
            maxPrice: 1000
        },
        onSubmit: (values) => {
            const filtered = allProducts.filter((product) => {
                if (
                    values.name &&
                    !product.name.toLowerCase().includes(values.name.toLowerCase())
                ) {
                    return false;
                }

                if (product.price < values.priceRange[0] || product.price > values.priceRange[1]) {
                    return false;
                }

                if (values.type.length > 0 && product.type && !values.type.includes(product.type)) {
                    return false;
                }

                if (
                    values.category &&
                    typeof product.category_id !== 'string' &&
                    product.category_id.name !== values.category
                ) {
                    return false;
                }

                return true;
            });

            setProducts(filtered);
        }
    });

    const { resetForm, handleSubmit, setFieldValue } = formik;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = (await API.products.getAll()) as unknown as APIResponse;

                if (response.data?.code >= 400) {
                    throw new Error(response.data.message || 'Failed to fetch products');
                }

                if (!response.data?.data || !Array.isArray(response.data.data)) {
                    throw new Error('Invalid products data received');
                }

                const formattedProducts: IProduct[] = response.data.data.map(
                    (product: APIProduct) => {
                        const category =
                            typeof product.category_id === 'string'
                                ? { _id: product.category_id, name: '' }
                                : product.category_id;

                        const supplier =
                            typeof product.supplier_id === 'string'
                                ? { _id: product.supplier_id, name: '' }
                                : product.supplier_id;

                        return {
                            ...product,
                            status:
                                product.stock_quantity && product.stock_quantity > 0
                                    ? 'available'
                                    : 'not available',
                            priceSale: null,
                            category_id: category,
                            supplier_id: supplier
                        };
                    }
                );

                setAllProducts(formattedProducts);
                setProducts(formattedProducts);
                setError(null);

                if (formattedProducts.length > 0) {
                    const calculatedMaxPrice = Math.max(...formattedProducts.map((p) => p.price));
                    const roundedMaxPrice = Math.ceil(calculatedMaxPrice / 100) * 100;
                    setMaxPrice(roundedMaxPrice);
                    setFieldValue('priceRange', [0, roundedMaxPrice]);
                    setFieldValue('maxPrice', roundedMaxPrice);
                }
            } catch (error: unknown) {
                let errorMessage = 'Failed to load products';

                if (typeof error === 'object' && error !== null && 'response' in error) {
                    const axiosError = error as { response?: { data?: { message?: string } } };
                    errorMessage = axiosError.response?.data?.message || errorMessage;
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }

                setError(errorMessage);
                setProducts([]);
                setAllProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleOpenFilter = () => {
        setOpenFilter(true);
    };

    const handleCloseFilter = () => {
        setOpenFilter(false);
        handleSubmit();
    };

    const handleResetFilter = () => {
        resetForm();
        setFieldValue('priceRange', [0, maxPrice]);
        setProducts(allProducts);
    };

    const handleEditProduct = (product: IProduct) => {
        navigate(`/dashboard/products/edit/${product._id}`);
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await API.products.delete(productId);
            setProducts(products.filter((product) => product._id !== productId));
            setAllProducts(allProducts.filter((product) => product._id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    return (
        <Page title="Dashboard: Products | Minimal-UI">
            <Container>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        Products
                    </Typography>
                    <Button
                        variant="contained"
                        component={RouterLink}
                        to="/dashboard/products/create"
                        startIcon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                        }
                    >
                        New Product
                    </Button>
                </Stack>

                <Stack
                    direction="row"
                    flexWrap="wrap-reverse"
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ mb: 5 }}
                >
                    <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
                        <ProductFilterSidebar
                            formik={formik}
                            isOpenFilter={openFilter}
                            onResetFilter={handleResetFilter}
                            onOpenFilter={handleOpenFilter}
                            onCloseFilter={handleCloseFilter}
                        />
                    </Stack>
                </Stack>

                {error ? (
                    <Typography color="error">{error}</Typography>
                ) : loading ? (
                    <Typography>Loading products...</Typography>
                ) : (
                    <ProductList
                        products={products}
                        onDeleteProduct={handleDeleteProduct}
                        onEditProduct={handleEditProduct}
                    />
                )}
            </Container>
        </Page>
    );
};

export default EcommerceShop;
