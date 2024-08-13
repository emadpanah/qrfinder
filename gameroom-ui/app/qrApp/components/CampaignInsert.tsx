import React, { useState } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { createCampaign } from '@/app/lib/api';

interface CampaignInsertProps {
  onInsertSuccess: () => void;
}

const CampaignInsert: React.FC<CampaignInsertProps> = ({ onInsertSuccess }) => {
  const { userId, accountData } = useUser();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [target, setTarget] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [products, setProducts] = useState<string[]>([]);

  const handleProductChange = (index: number, value: string) => {
    const newProducts = [...products];
    newProducts[index] = value;
    setProducts(newProducts);
  };

  const addProductInput = () => {
    setProducts([...products, '']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCampaign({
        shopId: 'shopId-placeholder', // Replace with actual shopId if needed
        name,
        description,
        videoUrl,
        imageUrl,
        expirationDate: new Date(expirationDate),
        target,
        reward: {
          tokens,
          products,
        },
        ownerTelegramId: userId!,
        ownerAddress: accountData.address!,
      });
      onInsertSuccess();
    } catch (error) {
      console.error('Error inserting campaign:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Insert Your Campaign</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Campaign Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Video URL</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Expiration Date</label>
          <input
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Insert Campaign
        </button>

      </form>
      </div>
    </div>
  );
};

export default CampaignInsert;
