// app/qrApp/components/ProductDetails.tsx
import React from 'react';
import { Product } from '@/app/lib/definitions';

interface ProductDetailsProps {
  product: Product;
  onAddToBasket: (product: Product) => void;
  onBack: () => void;
  onNavigateToBasket: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onAddToBasket, onBack, onNavigateToBasket }) => {
  return (
    <div className="product-details-container">
      <button onClick={onNavigateToBasket} className="shopping-cart-btn">Go to Cart</button>
      <h2>{product.base.Title}</h2>
      <img
        src={product.SmallImage || 'https://via.placeholder.com/150'}
        alt={product.base.Title}
        className="product-image"
      />
      <p>{product.base.Slogan}</p>
      <p>{product.base.Description}</p>
      <p>Quantity: {product.base.Quantity}</p>
      <button onClick={() => onAddToBasket(product)}>Add to Cart</button>
      <button onClick={onBack}>Back</button>
    </div>
  );
};

export default ProductDetails;
