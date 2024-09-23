// app/qrApp/components/ProductList.tsx
import React from 'react';
import { Product } from '@/app/lib/definitions';

interface ProductListProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  onNavigateToBasket: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onViewDetails, onNavigateToBasket }) => {
  return (
    <div className="product-list">
        <button onClick={onNavigateToBasket} className="shopping-cart-btn">Go to Cart</button>
      {products.length > 0 ? (
        products.map((product) => (
          <div key={product.Base.Id} className="product-item">
            <img
              src={product.SmallImage || 'https://via.placeholder.com/150'}
              alt={product.Base.Title}
              className="product-image"
            />
            <div className="product-details">
              <h2 className="product-title">{product.Base.Title}</h2>
              <p className="product-slogan">{product.Base.Slogan}</p>
              <p className="product-description">{product.Base.Description}</p>
              <p className="product-quantity">Quantity: {product.Base.Quantity}</p>
              <button onClick={() => onViewDetails(product)}>View Details</button>
            </div>
          </div>
        ))
      ) : (
        <p>No products available</p>
      )}
    </div>
  );
};

export default ProductList;
