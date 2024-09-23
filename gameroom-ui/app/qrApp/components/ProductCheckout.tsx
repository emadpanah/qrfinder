// app/qrApp/components/ProductCheckout.tsx
import React from 'react';

interface ProductCheckoutProps {
  onConfirmCheckout: () => void;
  onCancel: () => void;
}

const ProductCheckout: React.FC<ProductCheckoutProps> = ({ onConfirmCheckout, onCancel }) => {
  return (
    <div>
      <h1>Checkout</h1>
      <p>Confirm your order?</p>
      <button onClick={onConfirmCheckout}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default ProductCheckout;
