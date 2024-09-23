import React, { useState } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { createCampaign } from '@/app/lib/api';
import { Types } from 'mongoose';

const generateRandomNumber = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getDefaultExpirationDate = () => {
  const currentDate = new Date();
  const futureDate = new Date();
  futureDate.setFullYear(currentDate.getFullYear() + 2);
  return futureDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
};

const generateDefaultName = () => `Campaign-${generateRandomNumber()}`;

interface CampaignInsertProps {
  onInsertSuccess: () => void;
}

const CampaignInsert: React.FC<CampaignInsertProps> = ({ onInsertSuccess }) => {
  const { userId, accountData } = useUser();

  const [name, setName] = useState(generateDefaultName());
  const [expirationDate, setExpirationDate] = useState(getDefaultExpirationDate());
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [target, setTarget] = useState(0);
  const [tokens, setTokens] = useState(0);

  const [isFrozen, setIsFrozen] = useState(true);

  const handleNameFocus = () => {
    if (name.startsWith('Campaign-')) {
      setName(''); // Clear the name if it's the default generated one
    }
  };

  const handleNameBlur = () => {
    if (name.trim() === '') {
      setName(generateDefaultName()); // Set a new default name if the field is left empty
    }
  };

  const handleUnfreeze = () => {
    setIsFrozen(false); // Unfreeze all fields when any part of the div or its content is clicked
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const telegramID = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'unknown';

    try {
      await createCampaign({
        shopId: '66b625aace4f2777cf3be0dd',
        name: name,
        description: description || 'tyt',
        videoUrl: videoUrl || 'https://example.com/video',
        imageUrl: imageUrl || 'https://example.com/image',
        expirationDate: new Date(expirationDate).getTime(),//"2026-08-26T00:00:00.000Z"),
        target: target,
        reward: { tokens: tokens, products: [] },
        ownerTelegramId: userId ? userId: telegramID,
        ownerAddress: accountData.address!,
        _id: new Types.ObjectId().toString(),
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
              onFocus={handleNameFocus}
              onBlur={handleNameBlur}
              onChange={(e) => setName(e.target.value)}
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

          {/* Wrap all fields that should be unfrozen together */}
          <div className="mb-4" onClick={handleUnfreeze}>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isFrozen ? 'text-gray-400' : ''}`}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-2 border border-gray-300 rounded ${isFrozen ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={isFrozen}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isFrozen ? 'text-gray-400' : ''}`}>Video URL</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className={`w-full p-2 border border-gray-300 rounded ${isFrozen ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={isFrozen}
              />
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isFrozen ? 'text-gray-400' : ''}`}>Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={`w-full p-2 border border-gray-300 rounded ${isFrozen ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={isFrozen}
              />
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isFrozen ? 'text-gray-400' : ''}`}>Target</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value))}
                className={`w-full p-2 border border-gray-300 rounded ${isFrozen ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={isFrozen}
                required
              />
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isFrozen ? 'text-gray-400' : ''}`}>Tokens</label>
              <input
                type="number"
                value={tokens}
                onChange={(e) => setTokens(parseInt(e.target.value))}
                className={`w-full p-2 border border-gray-300 rounded ${isFrozen ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={isFrozen}
              />
            </div>
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
