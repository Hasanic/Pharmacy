import React, { useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Link, Typography, Stack, Button, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { fCurrency } from '@/utils/formatNumber';
import Label from '../../Label';
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

const extractFilenameFromPath = (path: string): string | null => {
    try {
        return path.split(/[\\/]/).pop() || null;
    } catch {
        return null;
    }
};

const buildProductImageUrl = (filename: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl.replace(/\/api$/, '')}/api/products/image/${encodeURIComponent(filename)}`;
};

interface Props {
    product: IProduct;
    onEdit?: (product: IProduct) => void;
    onDelete?: (productId: string) => void;
}

export const ShopProductCard = (props: Props): JSX.Element => {
    const { product, onEdit, onDelete } = props;
    const { _id, name, price, status, image } = product;
    const [imgError, setImgError] = useState(false);

    const imageUrl = useMemo(() => {
        if (!image) return null;
        if (image.startsWith('http')) return image;
        const filename = extractFilenameFromPath(image);
        if (!filename) return null;
        return buildProductImageUrl(filename);
    }, [image]);

    const handleImageError = () => {
        setImgError(true);
    };

    const handleEdit = () => onEdit?.(product);
    const handleDelete = () => onDelete?.(_id);

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ pt: '100%', position: 'relative' }}>
                {status && (
                    <Label
                        variant="filled"
                        color={status === 'sale' ? 'error' : 'info'}
                        sx={{
                            zIndex: 9,
                            top: 16,
                            right: 16,
                            position: 'absolute',
                            textTransform: 'uppercase'
                        }}
                    >
                        <span>{status}</span>
                    </Label>
                )}

                {imageUrl ? (
                    <ProductImgStyle
                        alt={name}
                        src={imageUrl}
                        onError={handleImageError}
                        loading="lazy"
                    />
                ) : (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            width: '100%',
                            height: '100%',
                            bgcolor: 'grey.200',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            No Image
                        </Typography>
                    </Box>
                )}
            </Box>

            <Stack spacing={2} sx={{ p: 3, flexGrow: 1 }}>
                <Tooltip title={name} arrow>
                    <Link component={RouterLink} to="#" color="inherit" underline="hover">
                        <Typography variant="subtitle2" noWrap>
                            {name}
                        </Typography>
                    </Link>
                </Tooltip>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {fCurrency(price)}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                    <Tooltip title="Edit product">
                        <Button
                            fullWidth
                            variant="contained"
                            size="small"
                            onClick={handleEdit}
                            startIcon={<Icon icon={editFill} />}
                        />
                    </Tooltip>
                    <Tooltip title="Delete product">
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={handleDelete}
                            startIcon={<Icon icon={trashOutline} />}
                        />
                    </Tooltip>
                </Stack>
            </Stack>
        </Card>
    );
};

export default ShopProductCard;
