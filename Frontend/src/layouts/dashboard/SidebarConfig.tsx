import React from 'react';
import { Icon, IconifyIcon } from '@iconify/react';
import pieChart2Fill from '@iconify/icons-eva/pie-chart-2-fill';
import peopleFill from '@iconify/icons-eva/people-fill';
import shoppingBagFill from '@iconify/icons-eva/shopping-bag-fill';
import { NavItemConfig } from '@/models';

const getIcon = (name: string | IconifyIcon) => <Icon icon={name} width={22} height={22} />;
const sidebarConfig: NavItemConfig[] = [
    {
        title: 'dashboard',
        path: '/dashboard/app',
        icon: getIcon(pieChart2Fill)
    },
    {
        title: 'Medicine',
        path: '/dashboard/Medicine',
        icon: getIcon('mdi:medical-bag')
    },
    {
        title: 'Inventory',
        path: '/dashboard/Inventory',
        icon: getIcon('mdi:warehouse')
    },
    {
        title: 'Sales',
        path: '/dashboard/Sales',
        icon: getIcon('mdi:point-of-sale')
    },
    {
        title: 'Prescriptions',
        path: '/dashboard/Prescriptions',
        icon: getIcon('mdi:prescription')
    },
    {
        title: 'Customers',
        path: '/dashboard/Customers',
        icon: getIcon('mdi:account-group-outline')
    },
    {
        title: 'Doctors',
        path: '/dashboard/Doctors',
        icon: getIcon('mdi:doctor')
    },
    {
        title: 'payment',
        path: '/dashboard/payment',
        icon: getIcon('mdi:cash-multiple')
    },
    {
        title: 'Suppliers',
        path: '/dashboard/Suppliers',
        icon: getIcon('mdi:truck-delivery-outline')
    },
    {
        title: 'Category',
        path: '/dashboard/Category',
        icon: getIcon('mdi:shape-outline')
    },
    {
        title: 'user',
        path: '/dashboard/user',
        icon: getIcon('mdi:account-cog-outline')
    }
];

// const sidebarConfig: NavItemConfig[] = [
//     {
//         title: 'dashboard',
//         path: '/dashboard/app',
//         icon: getIcon(pieChart2Fill)
//     },
//     {
//         title: 'Sales',
//         path: '/dashboard/Sales',
//         icon: getIcon('mdi:point-of-sale')
//     },
//     {
//         title: 'Medicine',
//         path: '/dashboard/Medicine',
//         icon: getIcon('mdi:medical-bag')
//     },
//     {
//         title: 'Inventory',
//         path: '/dashboard/Inventory',
//         icon: getIcon('mdi:warehouse')
//     },
//     {
//         title: 'Prescriptions',
//         path: '/dashboard/Prescriptions',
//         icon: getIcon('mdi:prescription')
//     },
//     {
//         title: 'Customers',
//         path: '/dashboard/Customers',
//         icon: getIcon('mdi:account-group-outline')
//     },
//     {
//         title: 'Doctors',
//         path: '/dashboard/Doctors',
//         icon: getIcon('mdi:doctor')
//     },
//     {
//         title: 'Category',
//         path: '/dashboard/Category',
//         icon: getIcon('mdi:shape-outline')
//     },
//     {
//         title: 'Suppliers',
//         path: '/dashboard/Suppliers',
//         icon: getIcon('mdi:truck-delivery-outline')
//     },
//     {
//         title: 'payment',
//         path: '/dashboard/payment',
//         icon: getIcon('mdi:cash-multiple')
//     },
//     {
//         title: 'user',
//         path: '/dashboard/user',
//         icon: getIcon('mdi:account-cog-outline')
//     }
// ];

export default sidebarConfig;
