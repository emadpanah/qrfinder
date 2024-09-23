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
      <h2>{product.Base.Title}</h2>
      <img
        src={product.SmallImage || 'https://via.placeholder.com/150'}
        alt={product.Base.Title}
        className="product-image"
      />
      <p>{product.Base.Slogan}</p>
      <p>{product.Base.Description}</p>
      <p>Quantity: {product.Base.Quantity}</p>
      <button onClick={() => onAddToBasket(product)}>Add to Cart</button>
      <button onClick={onBack}>Back</button>
    </div>
  );
};

export default ProductDetails;
