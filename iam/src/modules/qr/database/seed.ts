import { connect, disconnect, model, Types } from 'mongoose';
import { Shop, ShopSchema } from './schemas/qr-shop.schema';
import { Campaign, CampaignSchema } from './schemas/qr-campaign.schema';
import { Achievement, AchievementSchema } from './schemas/qr-achievement.schema';

const dbUri = 'your-mongodb-uri';

async function seed() {
  await connect(dbUri);
  
  const ShopModel = model('Shop', ShopSchema);
  const CampaignModel = model('Campaign', CampaignSchema);
  const AchievementModel = model('Achievement', AchievementSchema);

  // Create Shops
  const maghaziShop = new ShopModel({
    name: 'Maghazi',
    description: 'Online shop with QR code campaign',
    campaigns: [],
  });

  const caymanTokenShop = new ShopModel({
    name: 'Cayman Token ICO',
    description: 'QR code campaign for Cayman Token ICO',
    campaigns: [],
  });

  await maghaziShop.save();
  await caymanTokenShop.save();

  // Create Campaigns
  const maghaziCampaign = new CampaignModel({
    shopId: maghaziShop._id,
    name: 'Maghazi City QR Campaign',
    description: 'Scan 5 QR codes in the city to earn tokens',
    achievements: [],
    expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months from now
  });

  const caymanTokenCampaign = new CampaignModel({
    shopId: caymanTokenShop._id,
    name: 'Cayman Token QR Campaign',
    description: 'Scan 10 QR codes to earn tokens',
    achievements: [],
    expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months from now
  });

  await maghaziCampaign.save();
  await caymanTokenCampaign.save();

  // Create Achievements for Maghazi Campaign
  for (let i = 1; i <= 5; i++) {
    const achievement = new AchievementModel({
      campaignId: maghaziCampaign._id,
      name: `Maghazi QR Code ${i}`,
      description: `Scan QR code ${i} in the city`,
      type: 'unordered',
      target: 1,
      reward: {
        tokens: 300,
        products: [],
      },
      expirationDate: maghaziCampaign.expirationDate,
      expectedLocation: {
        lat: 0, // Add actual latitude
        lon: 0, // Add actual longitude
        allowedRange: 100, // 100 meters
      },
    });

    await achievement.save();
    maghaziCampaign.achievements.push(achievement._id);
  }

  await maghaziCampaign.save();

  // Create Achievements for Cayman Token Campaign
  for (let i = 1; i <= 10; i++) {
    const achievement = new AchievementModel({
      campaignId: caymanTokenCampaign._id,
      name: `Cayman Token QR Code ${i}`,
      description: `Scan QR code ${i}`,
      type: 'unordered',
      target: 1,
      reward: {
        tokens: 200,
        products: [],
      },
      expirationDate: caymanTokenCampaign.expirationDate,
      expectedLocation: {
        lat: 0, // Add actual latitude
        lon: 0, // Add actual longitude
        allowedRange: 100, // 100 meters
      },
    });

    await achievement.save();
    caymanTokenCampaign.achievements.push(achievement._id);
  }

  await caymanTokenCampaign.save();

  // Update Shops with Campaigns
  maghaziShop.campaigns.push(maghaziCampaign._id);
  caymanTokenShop.campaigns.push(caymanTokenCampaign._id);

  await maghaziShop.save();
  await caymanTokenShop.save();

  await disconnect();
  console.log('Seeding completed.');
}

seed().catch(err => console.error('Seeding error:', err));
