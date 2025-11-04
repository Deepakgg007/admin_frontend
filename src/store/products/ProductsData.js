import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

import { MediaGroup, Media, MediaText, Image, Icon, CustomDropdownToggle, CustomDropdownMenu, LinkList, LinkListItem, Rating } from "../../components";

// product table column
export const productsColumns = [
    {
        name: "products",
        grow: 3,
        selector: (row) => row.name,
        cell: (row) => (
            <MediaGroup>
                <Media to={`/ecommerce/edit-product/${row.id}`} size="md">
                    <Image src={row.src} staticImage/>
                </Media>
                <MediaText>
                    <Link to={`/ecommerce/edit-product/${row.id}`} className="title">{row.name}</Link>
                </MediaText>
            </MediaGroup>
        ),
        sortable: true,
    },
    {
        name: "sku",
        selector: (row) => row.sku,
        cell: (row) => (
            <span>{row.sku}</span>
        ),
        sortable: true,
        hide: "md",
    },
    {
        name: "qty",
        selector: (row) => row.qty,
        cell: (row) => (
            <div className="blank">
                {row.qty === "0" ? 
                    <div className="d-flex align-items-center">
                        <span className="text-danger me-1">{row.qty}</span>
                        <span className="badge text-bg-danger-soft">Sold out</span>
                    </div> : 
                    row.qty === "4" ?
                    <div className="d-flex align-items-center">
                        <span className="text-warning me-1">{row.qty}</span>
                        <span className="badge text-bg-warning-soft">Low stock</span>
                    </div> :
                    <span className="small">{row.qty}</span>
                }
            </div>
        ),
        sortable: true,
        hide: "lg",
    },
    {
        name: "price",
        selector: (row) => row.price,
        cell: (row) => (
            <span className="small">${row.price}</span>
        ),
        sortable: true,
        hide: "lg",
    },
    {
        name: "rating",
        selector: (row) => row.rating,
        cell: (row) => (
            <Rating rating={row.rating} />
        ),
        sortable: true,
        hide: "lg",
    },
    {
        name: "status",
        selector: (row) => row.status,
        cell: (row) => (
            <span className={`badge text-bg-${
                row.status === "Published" ? "success-soft" 
                : row.status === "Scheduled" ? "info-soft" 
                : row.status === "Inactive" ? "danger-soft" 
                : "secondary-soft"}`
            }>
            {row.status ? row.status : 'General'}
            </span>
        ),
        sortable: true,
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
                                <LinkListItem to={`/ecommerce/edit-product/${row.id}`}>
                                    <Icon name="edit"></Icon><span>Edit</span>
                                </LinkListItem>
                                <LinkListItem to={`/ecommerce/edit-product/${row.id}`}>
                                    <Icon name="trash"></Icon><span>Delete</span>
                                </LinkListItem>
                                <LinkListItem to="/ecommerce/products">
                                    <Icon name="eye"></Icon><span>View Details</span>
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

// products data
const products = [
    {
        id:'uid01',
        name: 'Pink Fitness Tracker',
        src: '/images/product/a.jpg',
        sku: '0533009',
        qty: '42',
        price: '126.00',
        status: 'Published',
        rating: 5
    },
    {
        id:'uid02',
        name: 'Pool Party Drink Holder',
        src: '/images/product/b.jpg',
        sku: '0253800',
        qty: '12',
        price: '35.99',
        status: 'Scheduled',
        rating: 4
    },
    {
        id:'uid03',
        name: 'AliExpress Fitness Trackers',
        src: '/images/product/c.jpg',
        sku: '0253804',
        qty: '15',
        price: '135.99',
        status: 'Inactive',
        rating: 3
    },
    {
        id:'uid04',
        name: 'iPhone 7 Headphones',
        src: '/images/product/d.jpg',
        sku: '0253807',
        qty: '13',
        price: '45.99',
        status: 'Inactive',
        rating: 3
    },
    {
        id:'uid05',
        name: 'Purple Blue Gradient iPhone Case',
        src: '/images/product/e.jpg',
        sku: '0253808',
        qty: '0',
        price: '145.99',
        status: 'Inactive',
        rating: 2
    },
    {
        id:'uid06',
        name: 'Wireless Waterproof Speaker',
        src: '/images/product/f.jpg',
        sku: '0253808',
        qty: '23',
        price: '14.99',
        status: 'Published',
        rating: 4
    },
    {
        id:'uid07',
        name: 'Black Headphones',
        src: '/images/product/g.jpg',
        sku: '0253809',
        qty: '11',
        price: '144.99',
        status: 'Published',
        rating: 4
    },
    {
        id:'uid08',
        name: 'Flared Shift Dress',
        src: '/images/product/h.jpg',
        sku: '0253806',
        qty: '11',
        price: '34.99',
        status: 'Scheduled',
        rating: 5
    },
    {
        id:'uid09',
        name: 'Nio Extended Camera',
        src: '/images/product/i.jpg',
        sku: '0253806',
        qty: '17',
        price: '134.99',
        status: 'Inactive',
        rating: 3
    },
    {
        id:'uid10',
        name: 'Battery Charger',
        src: '/images/product/j.jpg',
        sku: '0253806',
        qty: '21',
        price: '134.99',
        status: 'Inactive',
        rating: 4
    },
    {
        id:'uid11',
        name: 'Laptop Case Bag',
        src: '/images/product/k.jpg',
        sku: '0253806',
        qty: '22',
        price: '134.99',
        status: 'Published',
        rating: 3
    },
    {
        id:'uid12',
        name: 'Digital Camera 16x',
        src: '/images/product/l.jpg',
        sku: '0253802',
        qty: '22',
        price: '134.99',
        status: 'Scheduled',
        rating: 2
    },
    {
        id:'uid13',
        name: 'Casual Note Bag',
        src: '/images/product/m.jpg',
        sku: '0253802',
        qty: '65',
        price: '13.99',
        status: 'Published',
        rating: 5
    },
    {
        id:'uid14',
        name: 'Blue Gentle Shoes',
        src: '/images/product/n.jpg',
        sku: '0253802',
        qty: '0',
        price: '13.99',
        status: 'Inactive',
        rating: 3
    },
    {
        id:'uid15',
        name: 'Casual Blue Shoes',
        src: '/images/product/o.jpg',
        sku: '0253800',
        qty: '4',
        price: '13.99',
        status: 'Published',
        rating: 4
    },
    {
        id:'uid16',
        name: 'Black Grey Headset',
        src: '/images/product/p.jpg',
        sku: '0253806',
        qty: '24',
        price: '113.99',
        status: 'Published',
        rating: 4
    },
];

export default products;
