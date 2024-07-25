import axios from 'axios';
import { PiCompassToolDuotone } from 'react-icons/pi';

const iamServiceUrl = process.env.NEXT_PUBLIC_IAM_SERVICE_URL;
const APP_SECRET = process.env.NEXT_PUBLIC_APP_SECRET || 'default_app_secret';

const api = axios.create({
  baseURL: iamServiceUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RegisterUserParams {
  address: string;
  telegramID: string;
  walletType: string;
}

export const registerUser = async ({ address, telegramID, walletType }: RegisterUserParams) => {
  try {
    const response = await api.post('/iam/register', {
      address,
      telegramID,
      walletType,
      clientSecret: APP_SECRET,
    });

    const { token: authToken, isNewToken, userId } = response.data;
    localStorage.setItem('authToken', authToken);

    return { authToken, isNewToken, userId };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error registering user:', error.response?.data || error.message);
      throw new Error(error.response?.data || error.message);
    } else if (error instanceof Error) {
      console.error('Error registering user:', error.message);
      throw error;
    } else {
      console.error('Unknown error:', error);
      throw new Error('An unknown error occurred.');
    }
  }
};

export const fetchCampaigns = async () => {
  try {
    const response = await api.get('/qr-campaigns');
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

export const fetchActiveCampaigns = async () => {
  try {
    console.log("get campaigns active");
    const response = await api.get('/qr-campaigns/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    throw error;
  }
};

export const fetchCampaignById = async (campaignId: string) => {
  try {
    const response = await api.get(`/qr-campaigns/findById`, { params: { id: campaignId } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching campaign by ID ${campaignId}:`, error);
    throw error;
  }
};

export const fetchAchievementsByCampaignId = async (campaignId: string) => {
  try {
    const response = await api.get(`/qr-achievements/getAll`, { params: { campaignId: campaignId } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching achievements for campaign ID ${campaignId}:`, error);
    throw error;
  }
};

export const fetchUserDetails = async (userId: string) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user details for userId ${userId}:`, error);
    throw error;
  }
};

// Updated API call to select an achievement
export const selectAchievement = async (achievementId: string, userId: string) => {
  try {
   //console.log("achievementId/userId", achievementId, userId);
    const response = await api.post('/qr-achievements/create-selected', {
      achievementId: achievementId,
      userId: userId,
    });
    return response.data;
  } catch (error) {
    console.error(`Error selecting achievement ID ${achievementId}:`, error);
    throw error;
  }
};

export const fetchSelectedAchievementsByUser = async (userId: string) => {
  try {
    const response = await api.get(`/qr-achievements/get-selected`, { params: { userId: userId } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching selected achievements for user ID ${userId}:`, error);
    throw error;
  }
};

export const unselectAchievement = async (achievementId: string, userId: string) => {
  try {
    console.log("unselectAchievement", achievementId, userId);
    const response = await api.delete('/qr-achievements/delete-selected', {
      data: { achievementId, userId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error unselecting achievement ID ${achievementId}:`, error);
    throw error;
  }
};

export const generateUserSpecificQRCode = async (achievementId: string, userId: string) => {
  try {
    const response = await api.post('/qr-achievements/generate-qrcode', {
      achievementId: achievementId,
      userId: userId,
    });
    return response.data.qrCode;
  } catch (error) {
    console.error(`Error generating QR code for achievement ID ${achievementId}:`, error);
    throw error;
  }
};