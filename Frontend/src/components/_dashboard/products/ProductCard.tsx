// import React, { useState } from 'react';
// import { Link as RouterLink } from 'react-router-dom';
// import { Box, Card, Link, Typography, Stack } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import { fCurrency } from '@/utils/formatNumber';
// import Label from '../../Label';
// import previewImage from '@/assets/images/preview.png';
// import { IProduct } from '@/models';

// const ProductImgStyle = styled('img')({
//     top: 0,
//     width: '100%',
//     height: '100%',
//     objectFit: 'cover',
//     position: 'absolute'
// });

// interface Props {
//     product: IProduct;
// }

// export const ShopProductCard = (props: Props): JSX.Element => {
//     const { name, price, colors, status, priceSale } = props.product;
//     const [imgError, setImgError] = useState(false);

//     const handleImageError = () => {
//         setImgError(true);
//     };

//     return (
//         <Card>
//             <Box sx={{ pt: '100%', position: 'relative' }}>
//                 {status && (
//                     <Label
//                         variant="filled"
//                         color={(status === 'sale' && 'error') || 'info'}
//                         sx={{
//                             zIndex: 9,
//                             top: 16,
//                             right: 16,
//                             position: 'absolute',
//                             textTransform: 'uppercase'
//                         }}
//                     >
//                         <Typography component="span" variant="body2">
//                             {status}
//                         </Typography>
//                     </Label>
//                 )}
//                 <ProductImgStyle alt={name} src={previewImage} onError={handleImageError} />
//             </Box>

//             <Stack spacing={2} sx={{ p: 3 }}>
//                 <Link to="#" color="inherit" underline="hover" component={RouterLink}>
//                     <Typography variant="subtitle2" noWrap>
//                         {name}
//                     </Typography>
//                 </Link>

// <Stack direction="row" alignItems="center" justifyContent="space-between">
//     <Typography variant="subtitle1">
//         <Typography
//             component="span"
//             variant="body1"
//             sx={{
//                 fontWeight: 'bold'
//             }}
//         >
//             &nbsp;
//             {fCurrency(price)}
//         </Typography>
//     </Typography>
// </Stack>
//             </Stack>
//         </Card>
//     );
// };

// export default ShopProductCard;

import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Link, Typography, Stack, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { fCurrency } from '@/utils/formatNumber';
import Label from '../../Label';
import previewImage from '@/assets/images/preview.png';
import { IProduct } from '@/models';
import { Icon } from '@iconify/react';
import editFill from '@iconify/icons-eva/edit-fill';
import trashOutline from '@iconify/icons-eva/trash-2-outline';

const ProductImgStyle = styled('img')({
    top: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute'
});

interface Props {
    product: IProduct;
    onEdit?: (product: IProduct) => void;
    onDelete?: (productId: string) => void;
}

export const ShopProductCard = (props: Props): JSX.Element => {
    const { product, onEdit, onDelete } = props;
    const { id, name, price, priceSale, status } = product;
    const [imgError, setImgError] = useState(false);

    const handleImageError = () => {
        setImgError(true);
    };

    const handleEdit = () => {
        if (onEdit) onEdit(product);
    };

    const handleDelete = () => {
        if (onDelete) onDelete(id);
    };

    return (
        <Card>
            <Box sx={{ pt: '100%', position: 'relative' }}>
                {status && (
                    <Label
                        variant="filled"
                        color={(status === 'sale' && 'error') || 'info'}
                        sx={{
                            zIndex: 9,
                            top: 16,
                            right: 16,
                            position: 'absolute',
                            textTransform: 'uppercase'
                        }}
                    >
                        <Typography component="span" variant="body2">
                            {status}
                        </Typography>
                    </Label>
                )}
                <ProductImgStyle
                    alt={name}
                    src={imgError ? previewImage : previewImage}
                    onError={handleImageError}
                />
            </Box>

            <Stack spacing={2} sx={{ p: 3 }}>
                <Link to="#" color="inherit" underline="hover" component={RouterLink}>
                    <Typography variant="subtitle2" noWrap>
                        {name}
                    </Typography>
                </Link>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">
                        <Typography
                            component="span"
                            variant="body1"
                            sx={{
                                fontWeight: 'bold'
                            }}
                        >
                            &nbsp;
                            {fCurrency(price)}
                        </Typography>
                    </Typography>
                </Stack>
                {/* <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">
                        {priceSale ? (
                            <>
                                <Typography
                                    component="span"
                                    variant="body1"
                                    sx={{
                                        color: 'text.disabled',
                                        textDecoration: 'line-through',
                                        mr: 1
                                    }}
                                >
                                    {fCurrency(price)}
                                </Typography>
                                <Typography
                                    component="span"
                                    variant="body1"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: 'error.main'
                                    }}
                                >
                                    {fCurrency(priceSale)}
                                </Typography>
                            </>
                        ) : (
                            <Typography
                                component="span"
                                variant="body1"
                                sx={{
                                    fontWeight: 'bold'
                                }}
                            >
                                {fCurrency(price)}
                            </Typography>
                        )}
                    </Typography>
                </Stack> */}

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        onClick={handleEdit}
                        startIcon={<Icon icon={editFill} width={16} height={16} />}
                        sx={{
                            flex: 1
                        }}
                    ></Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleDelete}
                        startIcon={<Icon icon={trashOutline} width={16} height={16} />}
                        sx={{
                            flex: 1
                        }}
                    ></Button>
                </Stack>
            </Stack>
        </Card>
    );
};

export default ShopProductCard;
