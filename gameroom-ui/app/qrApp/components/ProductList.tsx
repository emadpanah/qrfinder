import React from 'react';
import { Product } from '@/app/lib/definitions';
import styles from '../css/qrApp.module.css';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onEarnMoney: (product: Product) => void;
  onNavigateToBasket: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart, onEarnMoney, onNavigateToBasket }) => {
  return (
    <div className={`${styles.productListWrapper}`}>
      <div className="fixed bottom-0 w-full flex justify-center gap-4 p-4 bg-white">
        <button onClick={onNavigateToBasket} className={`${styles.goToCartButton}`}>
          Go to Cart
        </button>
        <button className={`${styles.earnMoneyButton}`}>
          Earn Money
        </button>
      </div>
      <div className={`${styles.productListContainer}`}>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.Base.Id} className={`${styles.productCard}`}>
              <img
                src={product.SmallImage || 'https://via.placeholder.com/150'}
                alt={product.Base.Title}
                className={`${styles.productImage}`}
              />
              <div className={`${styles.productDetails}`}>
                <h2 className={`${styles.productTitle}`}>{product.Base.Title}</h2>
                <p className={`${styles.productSlogan}`}>{product.Base.Slogan}</p>
                <p className={`${styles.productDescription}`}>{product.Base.Description}</p>
                <p className={`${styles.productPrice}`}>
                  {product.Price}
                  {product.MonthlyPrice && (
                    <>
                      <br />
                      <span className={`${styles.monthlyPrice}`}>
                        Monthly: {product.MonthlyPrice}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  className={`${styles.actionButton}`}
                  onClick={() => onAddToCart(product)}
                >
                  Add to Cart
                </button>
                <button
                  className={`${styles.actionButtonSecondary}`}
                  onClick={() => onEarnMoney(product)}
                >
                  Earn Money
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={`${styles.noProducts}`}>No products available</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
