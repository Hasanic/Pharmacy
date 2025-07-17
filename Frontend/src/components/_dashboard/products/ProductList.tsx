import React from 'react';
import { Grid } from '@mui/material';
import ShopProductCard from '@/components/_dashboard/products/ProductCard';
import { IProduct } from '@/models';

interface Props {
    products: any;
    order?: any;
}

const ProductList = (props: Props): JSX.Element => {
    const { products, ...other } = props;
    return (
        <Grid container spacing={3} {...other}>
            {products.map((product: IProduct) => (
                <Grid key={product.id} item xs={12} sm={6} md={3}>
                    <ShopProductCard product={product} />
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductList;
