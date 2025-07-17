// import React, { useState, useEffect } from 'react';
// import { HeaderLabel } from '@/models';
// import {
//     Card,
//     Table,
//     Stack,
//     Button,
//     TableRow,
//     TableBody,
//     TableCell,
//     Container,
//     Typography,
//     TableContainer,
//     TablePagination
// } from '@mui/material';
// import { Icon } from '@iconify/react';
// import { Link as RouterLink } from 'react-router-dom';
// import plusFill from '@iconify/icons-eva/plus-fill';
// import Page from '@/components/Page';
// import Scrollbar from '@/components/Scrollbar';
// import { UserListHead, UserListToolbar } from '@/components/_dashboard/user';
// import API from '@/setting/endpoints';

// interface IUser {
//     id: string;
//     username: string;
//     unique_id?: number;
//     role?: {
//         _id?: string;
//         name?: string;
//     };
// }

// const TABLE_HEAD: HeaderLabel[] = [
//     { id: 'unique_id', label: 'ID', alignRight: false },
//     { id: 'username', label: 'Username', alignRight: false },
//     { id: 'role', label: 'Role', alignRight: false }
// ];

// const User = (): JSX.Element => {
//     const [page, setPage] = useState(0);
//     const [order, setOrder] = useState<'asc' | 'desc'>('asc');
//     const [orderBy, setOrderBy] = useState('username');
//     const [filterName, setFilterName] = useState('');
//     const [rowsPerPage, setRowsPerPage] = useState(5);
//     const [users, setUsers] = useState<IUser[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [totalUsers, setTotalUsers] = useState(0);

//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 setLoading(true);
//                 const response = await API.users.getAll(page + 1);

//                 const mappedUsers: IUser[] = response.data.data.map((user: any) => ({
//                     id: user._id || '',
//                     username: user.username || '',
//                     unique_id: user.unique_id,
//                     role: user.role ? { _id: user.role._id, name: user.role.name } : undefined
//                 }));

//                 setUsers(mappedUsers);
//                 setTotalUsers(response.data.rows || mappedUsers.length);
//             } catch (error) {
//                 console.error('Failed to fetch users:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUsers();
//     }, [page, rowsPerPage]);

//     const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
//         const isAsc = orderBy === property && order === 'asc';
//         setOrder(isAsc ? 'desc' : 'asc');
//         setOrderBy(property);
//     };

//     const handleChangePage = (event: unknown, newPage: number) => {
//         setPage(newPage);
//     };

//     const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setRowsPerPage(parseInt(event.target.value, 10));
//         setPage(0);
//     };

//     const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setFilterName(event.target.value);
//     };

//     const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

//     const filteredUsers = filterName
//         ? users.filter((user) => user.username.toLowerCase().includes(filterName.toLowerCase()))
//         : users;

//     return (
//         <Page title="User | Minimal-UI">
//             <Container>
//                 <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
//                     <Typography variant="h4" gutterBottom>
//                         User
//                     </Typography>
//                     <Button
//                         variant="contained"
//                         component={RouterLink}
//                         to="/register"
//                         startIcon={<Icon icon={plusFill} />}
//                     >
//                         New User
//                     </Button>
//                 </Stack>
//                 <Card>
//                     <UserListToolbar
//                         numSelected={0}
//                         filterName={filterName}
//                         onFilterName={handleFilterByName}
//                     />

//                     <Scrollbar>
//                         <TableContainer sx={{ minWidth: 800 }}>
//                             <Table>
//                                 <UserListHead
//                                     order={order}
//                                     orderBy={orderBy}
//                                     headLabel={TABLE_HEAD}
//                                     rowCount={users.length}
//                                     numSelected={0}
//                                     onRequestSort={handleRequestSort}
//                                     // eslint-disable-next-line @typescript-eslint/no-empty-function
//                                     onSelectAllClick={() => {}}
//                                 />
//                                 <TableBody>
//                                     {filteredUsers
//                                         .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                                         .map((row) => {
//                                             const { id, username, role, unique_id } = row;
//                                             return (
//                                                 <TableRow hover key={id} tabIndex={-1}>
//                                                     <TableCell align="left">
//                                                         {unique_id || '-'}
//                                                     </TableCell>
//                                                     <TableCell
//                                                         component="th"
//                                                         scope="row"
//                                                         padding="none"
//                                                     >
//                                                         <Stack
//                                                             direction="row"
//                                                             alignItems="center"
//                                                             spacing={2}
//                                                         >
//                                                             <Typography variant="subtitle2" noWrap>
//                                                                 {username}
//                                                             </Typography>
//                                                         </Stack>
//                                                     </TableCell>
//                                                     <TableCell align="left">
//                                                         {role?.name || '-'}
//                                                     </TableCell>
//                                                 </TableRow>
//                                             );
//                                         })}
//                                     {emptyRows > 0 && (
//                                         <TableRow style={{ height: 53 * emptyRows }}>
//                                             <TableCell colSpan={6} />
//                                         </TableRow>
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </TableContainer>
//                     </Scrollbar>

//                     <TablePagination
//                         rowsPerPageOptions={[5, 10, 25]}
//                         component="div"
//                         count={totalUsers}
//                         rowsPerPage={rowsPerPage}
//                         page={page}
//                         onPageChange={handleChangePage}
//                         onRowsPerPageChange={handleChangeRowsPerPage}
//                     />
//                 </Card>
//             </Container>
//         </Page>
//     );
// };

// export default User;

import React, { useState, useEffect } from 'react';
import { HeaderLabel } from '@/models';
import {
    Card,
    Table,
    Stack,
    Button,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    TableContainer,
    TablePagination
} from '@mui/material';
import { Icon } from '@iconify/react';
import { Link as RouterLink } from 'react-router-dom';
import plusFill from '@iconify/icons-eva/plus-fill';
import Page from '@/components/Page';
import Scrollbar from '@/components/Scrollbar';
import { UserListHead, UserListToolbar } from '@/components/_dashboard/user';
import API from '@/setting/endpoints';

interface IUser {
    id: string;
    username: string;
    unique_id?: number;
    role?: {
        _id?: string;
        name?: string;
    };
}

const TABLE_HEAD: HeaderLabel[] = [
    { id: 'unique_id', label: 'ID', alignRight: false },
    { id: 'username', label: 'Username', alignRight: false },
    { id: 'role', label: 'Role', alignRight: false }
];

const User = (): JSX.Element => {
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState('username');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10); // Changed to match controller default
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await API.users.getAll(page + 1); // page + 1 because backend expects 1-based index

                const mappedUsers: IUser[] = response.data.data.map((user: any) => ({
                    id: user._id || '',
                    username: user.username || '',
                    unique_id: user.unique_id,
                    role: user.role ? { _id: user.role._id, name: user.role.name } : undefined
                }));

                setUsers(mappedUsers);
                setTotalUsers(response.data.rows || mappedUsers.length);
                setTotalPages(response.data.pages || 1);

                // If we have fewer records than page size, adjust rowsPerPage
                if (mappedUsers.length < rowsPerPage) {
                    setRowsPerPage(mappedUsers.length);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [page, rowsPerPage]);

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0); // Reset to first page when changing page size
    };

    const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterName(event.target.value);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalUsers) : 0;

    const filteredUsers = filterName
        ? users.filter((user) => user.username.toLowerCase().includes(filterName.toLowerCase()))
        : users;

    // Calculate the actual number of rows to display
    const displayedUsers = filteredUsers.slice(0, rowsPerPage);

    return (
        <Page title="User | Minimal-UI">
            <Container>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        User
                    </Typography>
                    {/* <Button
                        variant="contained"
                        component={RouterLink}
                        to="/register"
                        startIcon={<Icon icon={plusFill} />}
                    >
                        New User
                    </Button> */}
                </Stack>
                <Card>
                    <UserListToolbar
                        numSelected={0}
                        filterName={filterName}
                        onFilterName={handleFilterByName}
                    />

                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 800 }}>
                            <Table>
                                <UserListHead
                                    order={order}
                                    orderBy={orderBy}
                                    headLabel={TABLE_HEAD}
                                    rowCount={users.length}
                                    numSelected={0}
                                    onRequestSort={handleRequestSort}
                                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                                    onSelectAllClick={() => {}}
                                />
                                <TableBody>
                                    {displayedUsers.map((row) => {
                                        const { id, username, role, unique_id } = row;
                                        return (
                                            <TableRow hover key={id} tabIndex={-1}>
                                                <TableCell align="left">
                                                    {unique_id || '-'}
                                                </TableCell>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                    padding="none"
                                                >
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        spacing={2}
                                                    >
                                                        <Typography variant="subtitle2" noWrap>
                                                            {username}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="left">
                                                    {role?.name || '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {emptyRows > 0 && (
                                        <TableRow style={{ height: 53 * emptyRows }}>
                                            <TableCell colSpan={6} />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Scrollbar>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={totalUsers}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Card>
            </Container>
        </Page>
    );
};

export default User;
