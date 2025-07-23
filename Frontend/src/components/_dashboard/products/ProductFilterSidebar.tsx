import React, { useEffect } from 'react';
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
    FormControlLabel
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
    const { onResetFilter, onCloseFilter, isOpenFilter } = props;
    const { values, getFieldProps, setFieldValue, resetForm, initialValues } = props.formik;

    const typeValues = values.type || [];

    const handleApplyFilters = () => {
        props.formik.submitForm();
        onCloseFilter();
        setTimeout(() => {
            resetForm();
            setFieldValue('priceRange', [0, 1000]);
        }, 300);
    };

    useEffect(() => {
        if (isOpenFilter) {
            setFieldValue('priceRange', [0, 1000]);
            if (!values.type) {
                setFieldValue('type', []);
            }
        }
    }, [isOpenFilter, setFieldValue, values.type]);

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
                        open={isOpenFilter}
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
                                        Medicine Name
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        {...getFieldProps('name')}
                                        placeholder="Search by Medicine Name"
                                    />
                                </div>

                                <div>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Price
                                    </Typography>

                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            label="Min"
                                            type="number"
                                            onChange={(e) =>
                                                setFieldValue('priceRange', [
                                                    Math.max(0, Number(e.target.value)),
                                                    values.priceRange?.[1] || 1000
                                                ])
                                            }
                                            inputProps={{ min: 0, max: 1000 }}
                                        />
                                        <TextField
                                            label="Max"
                                            type="number"
                                            onChange={(e) =>
                                                setFieldValue('priceRange', [
                                                    values.priceRange?.[0] || 0,
                                                    Math.min(1000, Number(e.target.value))
                                                ])
                                            }
                                            inputProps={{ min: 0, max: 1000 }}
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
                                                        checked={typeValues.includes(item)}
                                                    />
                                                }
                                                label={item}
                                            />
                                        ))}
                                    </FormGroup>
                                </div>
                            </Stack>
                        </Scrollbar>
                        <Box sx={{ p: 3, display: 'flex', gap: 2 }}>
                            <Button
                                size="large"
                                type="button"
                                color="inherit"
                                variant="outlined"
                                onClick={handleApplyFilters}
                                sx={{ flex: 1 }}
                            >
                                Apply
                            </Button>
                            <Button
                                size="large"
                                type="button"
                                color="inherit"
                                variant="outlined"
                                onClick={onResetFilter}
                                startIcon={<Icon icon={roundClearAll} />}
                                sx={{ flex: 1 }}
                            >
                                Clear
                            </Button>
                        </Box>
                    </Drawer>
                </Form>
            </FormikProvider>
        </>
    );
};

export default ProductFilterSidebar;
