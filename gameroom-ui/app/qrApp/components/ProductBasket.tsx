// app/qrApp/components/ProductBasket.tsx
import React from 'react';
import { Product } from '@/app/lib/definitions';

interface ProductBasketProps {
  basket: Product[];
  onCheckout: () => void;
  onRemoveFromBasket: (productId: string) => void;
}

const ProductBasket: React.FC<ProductBasketProps> = ({ basket, onCheckout, onRemoveFromBasket }) => {
  return (
    <div>
      <h1>Shopping Basket</h1>
      {basket.length === 0 ? (
        <p>Your basket is empty</p>
      ) : (
        <ul>
          {basket.map((product) => (
            <li key={product.base.Id}>
              <h2>{product.base.Title}</h2>
              <p>{product.base.Description}</p>
              <button onClick={() => onRemoveFromBasket(product.base.Id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={onCheckout} disabled={basket.length === 0}>Checkout</button>
    </div>
  );
};

export default ProductBasket;
