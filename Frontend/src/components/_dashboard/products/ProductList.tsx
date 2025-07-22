import React from 'react';
import { Grid } from '@mui/material';
import ShopProductCard from '@/components/_dashboard/products/ProductCard';
import { IProduct } from '@/models';

interface Props {
    products: IProduct[] | null | undefined;
    onDeleteProduct?: (productId: string) => void;
    onEditProduct?: (product: IProduct) => void;
    order?: any;
}

const ProductList = (props: Props): JSX.Element => {
    const { products, onDeleteProduct, onEditProduct, ...other } = props;

    if (!products) {
        return <div>Loading products...</div>;
    }

    if (products.length === 0) {
        return <div>No products found</div>;
    }

    return (
        <Grid container spacing={3} {...other}>
            {products.map((product: IProduct) => (
                <Grid key={product._id} item xs={12} sm={6} md={3}>
                    <ShopProductCard
                        product={product}
                        onDelete={onDeleteProduct}
                        onEdit={onEditProduct}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductList;
