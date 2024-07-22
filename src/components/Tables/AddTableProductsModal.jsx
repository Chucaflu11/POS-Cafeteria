import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import AddTableProductSidebar from './AddTableProductSidebar.jsx';
import Products from '../Products';
import Categories from '../Categories';

import '../../styles/Tables/AddTableProductsModal.css'
import AddTableProductsSidebar from './AddTableProductSidebar.jsx';

function AddTableProductsModal({ closeTableProductsModal, fetchData, tableId }) {

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [cart, setCart] = useState([]);

    async function fetchProductsData() {
        try {
            const categoriesData = await invoke('get_categories');
            setCategories(categoriesData);

            const productsData = await invoke('get_products');
            setProducts(productsData);

            if (categoriesData.length > 0) {
                setSelectedCategory(categoriesData[0]);
            }
        } catch (error) {
            console.error('Error al obtener datos de la base de datos:', error);
        }
    }

    useEffect(() => {
        fetchProductsData();
    }, []);

    return (
        <div className="modal-overlay">
            <div className="modal-client-product-content">
                <div className="main-content">
                    <div className="content">
                        <AddTableProductsSidebar cart={cart} setCart={setCart} tableId={tableId} closeTableProductsModal={closeTableProductsModal} fetchData={fetchData} />
                        <div className="content-right">
                            <div className="products-menu">
                                <div className="main-buttons">
                                    {selectedCategory && (
                                        <Products
                                            products={products.filter(
                                                (product) => product.id_categoria === selectedCategory.id_categoria
                                            )}
                                            cart={cart}
                                            setCart={setCart}
                                        />
                                    )}
                                </div>
                                <Categories categories={categories} setSelectedCategory={setSelectedCategory} />
                            </div>
                        </div>
                    </div>
                    <button className="close-client-product-modal" onClick={closeTableProductsModal}>X</button>
                </div>
            </div>
        </div>
    );
};

export default AddTableProductsModal;