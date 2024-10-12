import React, { useState } from 'react';
import { Product } from '@/app/lib/definitions';
import styles from '../css/qrApp.module.css';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onEarnMoney: () => void;
  onNavigateToBasket: () => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onAddToCart,
  onEarnMoney,
  onNavigateToBasket,
}) => {
  const [selectedPrices, setSelectedPrices] = useState<{ [key: string]: string }>({});

  const handlePriceSelect = (productId: string, price: string) => {
    setSelectedPrices((prevSelectedPrices) => ({
      ...prevSelectedPrices,
      [productId]: price,
    }));
  };

  return (
    <div className={`${styles.productListContainer}`}>
      {/* Scrollable Product List */}
      <div className={`${styles.productScrollContainer}`}>
        {products.length > 0 ? (
          products.map((product) => {
            if (!product || !product.base || !product.base.Title || !product.base.Id) {
              console.error("Invalid product detected:", product);
              return null; // Skip rendering invalid products
            }

            const currency = product.language?.currency || ''; // Get the currency if available

            return (
              <div key={product.base.Id} className={`${styles.productCard}`}>
                <img
                  src={product.base.ImagesIds 
                    ? `https://tradeai.4cash.exchange/public/b2fcffb7-4e06-4fa0-b2e2-c1a35a1750bf/image/items/${product.base.ImagesIds}` 
                    : 'https://via.placeholder.com/150'}
                  alt={product.base.Title || 'Product Image'}
                  className={`${styles.productImage}`}
                />
                <div className={`${styles.productDetails}`}>
                  <h2 className={`${styles.productTitle}`}>
                    {product.base.Title}
                  </h2>

                  {/* Conditionally render price dropdown or single price */}
                  {product.valuePrices && product.valuePrices.length === 1 ? (
                    <p className={styles.singlePrice}>
                      {product.valuePrices[0].currentValues[0]?.title} - {parseInt(product.valuePrices[0].currentPrice.price).toLocaleString()} {currency}
                    </p>
                  ) : (
                    <div>
                      <select
                        id={`price-select-${product.base.Id}`}
                        className={styles.priceDropdown}
                        value={selectedPrices[product.base.Id] || ''}
                        onChange={(e) =>
                          handlePriceSelect(product.base.Id, e.target.value)
                        }
                      >
                        <option value="">Select a time</option>
                        {product.valuePrices && product.valuePrices.length > 0 ? (
                          product.valuePrices.map((priceObj, index) => (
                            <option key={index} value={priceObj.currentPrice.price}>
                              {priceObj.currentValues[0]?.title} - {parseInt(priceObj.currentPrice.price).toLocaleString()} {currency}
                            </option>
                          ))
                        ) : (
                          <option disabled>No prices available</option>
                        )}
                      </select>
                    </div>
                  )}

                  {/* Add More Button and Add to Cart */}
                  <div className={`${styles.buttonContainer}`}>
                    <button
                      className={`${styles.actionButton}`}
                      onClick={() => onAddToCart(product)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className={`${styles.actionButtonSecondary}`}
                      onClick={() => onAddToCart(product)}
                    >
                      More Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className={`${styles.noProducts}`}>No products available</p>
        )}
      </div>

      {/* Fixed Buttons at the bottom */}
      <div className={`${styles.fixedBottomButtons}`}>
        <button onClick={onNavigateToBasket} className={`${styles.cartButton}`}>
          Go to Cart
        </button>
        <button
          onClick={() => onEarnMoney()}
          className={`${styles.earnMoneyButton}`}
        >
          Earn Money
        </button>
      </div>
    </div>
  );
};

export default ProductList;
