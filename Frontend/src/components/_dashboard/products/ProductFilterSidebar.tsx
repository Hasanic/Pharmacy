import React from 'react';
import { Icon } from '@iconify/react';
import { Form, FormikProvider } from 'formik';
import closeFill from '@iconify/icons-eva/close-fill';
import roundClearAll from '@iconify/icons-ic/round-clear-all';
import roundFilterList from '@iconify/icons-ic/round-filter-list';
import {
    Box,
    Radio,
    Stack,
    Button,
    Drawer,
    Divider,
    Checkbox,
    FormGroup,
    IconButton,
    TextField,
    Typography,
    RadioGroup,
    FormControlLabel,
    Slider
} from '@mui/material';
import Scrollbar from '../../Scrollbar';

export const FILTER_CATEGORY_OPTIONS = ['Medicine', 'Equipment', 'Supplement', 'Other'];

interface Props {
    isOpenFilter: boolean;
    onResetFilter: () => void;
    onOpenFilter: () => void;
    onCloseFilter: () => void;
    formik: any;
}

const ProductFilterSidebar = (props: Props): JSX.Element => {
    const { onResetFilter, onCloseFilter } = props;
    const { values, getFieldProps, setFieldValue, resetForm } = props.formik;

    const handlePriceChange = (event: Event, newValue: number | number[]) => {
        setFieldValue('priceRange', newValue as number[]);
    };

    const handleApplyFilters = () => {
        props.formik.submitForm();
        onCloseFilter();
        setTimeout(() => {
            resetForm();
            setFieldValue('priceRange', [0, values.maxPrice]);
        }, 300);
    };

    return (
        <>
            <Button
                disableRipple
                color="inherit"
                endIcon={<Icon icon={roundFilterList} />}
                onClick={props.onOpenFilter}
            >
                Filters&nbsp;
            </Button>

            <FormikProvider value={props.formik}>
                <Form autoComplete="off" noValidate>
                    <Drawer
                        anchor="right"
                        open={props.isOpenFilter}
                        onClose={onCloseFilter}
                        PaperProps={{
                            sx: { width: 280, border: 'none', overflow: 'hidden' }
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ px: 1, py: 2 }}
                        >
                            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                Filters
                            </Typography>
                            <IconButton onClick={onCloseFilter}>
                                <Icon icon={closeFill} width={20} height={20} />
                            </IconButton>
                        </Stack>

                        <Divider />

                        <Scrollbar>
                            <Stack spacing={3} sx={{ p: 3 }}>
                                <div>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Search by Name
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        {...getFieldProps('name')}
                                        placeholder="Product name..."
                                    />
                                </div>

                                <div>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Price Range
                                    </Typography>
                                    <Slider
                                        value={values.priceRange}
                                        onChange={handlePriceChange}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={values.maxPrice || 1000}
                                        step={10}
                                    />
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            label="Min"
                                            type="number"
                                            value={values.priceRange[0]}
                                            onChange={(e) =>
                                                setFieldValue('priceRange', [
                                                    Number(e.target.value),
                                                    values.priceRange[1]
                                                ])
                                            }
                                        />
                                        <TextField
                                            label="Max"
                                            type="number"
                                            value={values.priceRange[1]}
                                            onChange={(e) =>
                                                setFieldValue('priceRange', [
                                                    values.priceRange[0],
                                                    Number(e.target.value)
                                                ])
                                            }
                                        />
                                    </Stack>
                                </div>

                                <div>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Category
                                    </Typography>
                                    <RadioGroup {...getFieldProps('category')}>
                                        {FILTER_CATEGORY_OPTIONS.map((item) => (
                                            <FormControlLabel
                                                key={item}
                                                value={item}
                                                control={<Radio />}
                                                label={item}
                                            />
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Product Type
                                    </Typography>
                                    <FormGroup>
                                        {FILTER_CATEGORY_OPTIONS.map((item) => (
                                            <FormControlLabel
                                                key={item}
                                                control={
                                                    <Checkbox
                                                        {...getFieldProps('type')}
                                                        value={item}
                                                        checked={values.type.includes(item)}
                                                    />
                                                }
                                                label={item}
                                            />
                                        ))}
                                    </FormGroup>
                                </div>
                            </Stack>
                        </Scrollbar>

                        <Box sx={{ p: 3 }}>
                            <Button
                                fullWidth
                                size="large"
                                type="button"
                                color="inherit"
                                variant="outlined"
                                onClick={handleApplyFilters}
                                sx={{ mb: 1 }}
                            >
                                Apply Filters
                            </Button>
                            <Button
                                fullWidth
                                size="large"
                                type="button"
                                color="inherit"
                                variant="outlined"
                                onClick={onResetFilter}
                                startIcon={<Icon icon={roundClearAll} />}
                            >
                                Clear All
                            </Button>
                        </Box>
                    </Drawer>
                </Form>
            </FormikProvider>
        </>
    );
};

export default ProductFilterSidebar;
