import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

import { MediaGroup, Media, MediaText, Image, Icon, CustomDropdownToggle, CustomDropdownMenu, LinkList, LinkListItem } from "../../components";

// categories table column
export const categoriesColumns = [
    {
        name: "category",
        grow: 9,
        selector: (row) => row.name,
        cell: (row) => (
            <MediaGroup>
                <Media to={`/ecommerce/edit-category/${row.id}`}>
                    <Image src={row.src} staticImage/>
                </Media>
                <MediaText>
                    <Link to={`/ecommerce/edit-category/${row.id}`} className="title">{row.name}</Link>
                    <div className="text smaller d-none d-sm-block">{row.description}</div>
                    <div className="d-sm-none">
                        <span>{row.items}</span>
                        {' '}
                        {row.items && <span className="text-light">{parseInt(row.items) === 0 ? 'Stock out' : parseInt(row.items) <= 12 ? 'Low stock' : 'items'}</span>}
                    </div>
                </MediaText>
            </MediaGroup>
        ),
        sortable: true,
    },
    {
        name: "type",
        selector: (row) => row.status,
        cell: (row) => (
            <span className={`badge text-bg-${
                row.status === "Main" ? "primary-soft" 
                : row.status === "Sub" ? "success-soft"
                : "secondary-soft"}`
            }>
            {row.status ? row.status : 'General'}
            </span>
        ),
        sortable: true,
        hide: "md",
    },
    {
        name: "items",
        selector: (row) => row.items,
        cell: (row) => (
            <div className="blank">
                {row.items === "0" ? 
                    <span className="badge text-bg-danger-soft">Stock out</span> : 
                    row.items <= "12" ? 
                    <div className="d-flex align-items-center">
                        <span className="fw-medium text-warning me-1">{row.items}</span>
                        <span className="badge text-bg-warning-soft">Low</span>
                    </div> :
                    <span>{row.items}</span>
                }
            </div>
        ),
        sortable: true,
        hide: "lg",
    },
    {
        name: "action",
        cell: (row) => (
            <div className="text-end w-100">
                <Dropdown>
                    <Dropdown.Toggle size="sm" as={CustomDropdownToggle} className="btn btn-sm btn-icon btn-zoom me-n1">
                        <Icon name="more-v"></Icon>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu-sm" as={CustomDropdownMenu} align="end">
                        <div className="dropdown-content py-1">
                            <LinkList className="link-list-hover-bg-primary link-list-md">
                                <LinkListItem to={`/ecommerce/edit-category/${row.id}`}>
                                    <Icon name="edit"></Icon><span>Edit</span>
                                </LinkListItem>
                                <LinkListItem to={`/ecommerce/edit-category/${row.id}`}>
                                    <Icon name="trash"></Icon><span>Delete</span>
                                </LinkListItem>
                            </LinkList>
                        </div>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        ),
        sortable: false,
        hide: "md",
    },
    
];

// categories data
const categories = [
    {
        id:'uid01',
        name: 'Household',
        description: 'Decurate your home with our wide selection',
        src: '/images/product/f.jpg',
        status: 'Main',
        items: "125"
    },
    {
        id:'uid02',
        name: 'Watches',
        description: 'Discover watches you have never seen before',
        src: '/images/product/g.jpg',
        status: 'Main',
        items: "25"
    },
    {
        id:'uid03',
        name: 'Headphones',
        description: 'Discover a wide range of Headphone including Razer, Gamdias, Logitech headphone',
        src: '/images/product/h.jpg',
        status: 'Sub',
        items: "0"
    },
    {
        id:'uid04',
        name: 'Speakers',
        description: 'Get your preferable Speakers at the best price',
        src: '/images/product/i.jpg',
        status: 'Main',
        items: "122"
    },
    {
        id:'uid05',
        name: 'Toothbrush',
        description: 'New Children Toothbrush U-Shape Baby Toothbrush With Handle Silicone',
        src: '/images/product/j.jpg',
        status: 'Main',
        items: "33"
    },
    {
        id:'uid06',
        name: 'Wines',
        description: 'Get the best offers on wine matched to your taste',
        src: '/images/product/k.jpg',
        status: 'Sub',
        items: "14"
    },
    {
        id:'uid07',
        name: 'Cameras',
        description: 'Browse B&H for a vast selection of Digital Cameras',
        src: '/images/product/l.jpg',
        status: 'Sub',
        items: "35"
    },
    {
        id:'uid08',
        name: 'T-shirts',
        description: 'Explore trendy collection of printed & solid t-shirts',
        src: '/images/product/m.jpg',
        status: 'Main',
        items: "12"
    },
    {
        id:'uid09',
        name: 'Health & Beauty',
        description: 'A great collection of Health and Beauty products online.',
        src: '/images/product/n.jpg',
        status: 'Main',
        items: "35"
    },
    {
        id:'uid10',
        name: 'Toys',
        description: 'Shop your way for our amazing selection Toys',
        src: '/images/product/o.jpg',
        status: 'Sub',
        items: "66"
    },
    {
        id:'uid11',
        name: 'Sandals',
        description: 'In season summer footwear with a huge range of options',
        src: '/images/product/a.jpg',
        status: 'Main',
        items: "57"
    },
    {
        id:'uid12',
        name: 'Footwear',
        description: 'Whatever your activity needs are, we’ve got you covered.',
        src: '/images/product/b.jpg',
        status: 'Main',
        items: "165"
    },
];

export default categories;
