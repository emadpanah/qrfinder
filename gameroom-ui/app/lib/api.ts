// app/lib/api.ts

import axios from 'axios';

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

    const { token: authToken, isNewToken } = response.data;
    localStorage.setItem('authToken', authToken);

    return { authToken, isNewToken };
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
    const response = await api.get(`/qr-campaigns//${campaignId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching campaign by ID ${campaignId}:`, error);
    throw error;
  }
};

export const fetchAchievementsByCampaignId = async (campaignId: string) => {
  try {
    const response = await api.get(`/qr-campaigns/${campaignId}/achievements`);
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

// You can add more API functions as needed
