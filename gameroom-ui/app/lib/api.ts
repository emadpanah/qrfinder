import axios from 'axios';
import { PiCompassToolDuotone } from 'react-icons/pi';
import { QRCode, AchievementSelectedFull, Balance } from './definitions';

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


export const createBalance = async (userId: string, transactionType: string,
  amount: number, currency: string, transactionEntityId: string, 
  balanceAfterTransaction: number) => {
  try {

    const response = await api.post('/balance/addtransaction', {
      userId: userId,
      transactionType: transactionType,
      amount: amount,
      currency: currency,
      transactionEntityId: transactionEntityId,
      balanceAfterTransaction: balanceAfterTransaction
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
  
};


export const fetchBalance = async (userId : string, currencyId?: string) => {
  try {
    const response = await api.get('/balance/', { params: { userId: userId, currency: currencyId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

export const fetchDefaultCurrency = async () => {
  try {
    const response = await api.get('/balance/currencydefault');
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

export const fetchCurrency = async (name : string) => {
  try {
    const response = await api.get('/balance/currencybyname', { params: { name: name } });
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
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
    const response = await api.get(`/qr-campaigns/findbyid`, { params: { id: campaignId } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching campaign by ID ${campaignId}:`, error);
    throw error;
  }
};

export const fetchQrCodesByAchievementId = async (achievementId: string) => {
  try {
    console.log('fetchQrCodesByAchievementId');
    const response = await api.get(`/qr-achievements/get-allqrcodes`, { params: { achievementId: achievementId } });
    return response.data;// as unknown as QRCode[];;
  } catch (error) {
    console.error(`Error fetching Qrcodes for achievements ID ${achievementId}:`, error);
    throw error;
  }
};

export const fetchAchievementById = async (achievementId: string) => {
  try {
    const response = await api.get(`/qr-achievements/findbyid`, { params: { id: achievementId } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching achievement by ID ${achievementId}:`, error);
    throw error;
  }
};

export const fetchAchievementsByCampaignId = async (campaignId: string) => {
  try {
    const response = await api.get(`/qr-achievements/getall`, { params: { campaignId: campaignId } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching achievements for campaign ID ${campaignId}:`, error);
    throw error;
  }
};

export const fetchAchievementsSelectedByCampaignId = async (campaignId: string, userId: string) => {
  try {
    const response = await api.get(`/qr-achievements/getallbyuser`, { params: { campaignId: campaignId, userId: userId } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching achievements selected for campaign ID ${campaignId}: and userId ${userId}`, error);
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

export const selectAchievement = async (achievementId: string, userId: string, parentId?: string): Promise<AchievementSelectedFull>  => {
  try {
    const requestBody: { achievementId: string; userId: string; parentId?: string } = {
      achievementId: achievementId,
      userId: userId,
    };
    console.log('p :', parentId);
    if (parentId!=='0') {
      requestBody.parentId = parentId;
    }

    const response = await api.post('/qr-achievements/create-selected', requestBody);
    console.log('create-selected', response);
    return response.data;
  } catch (error) {
    console.error(`Error selecting achievement ID ${achievementId}:`, error);
    throw error;
  }
};


export const fetchAchievementSelectFullByUA = async (achievementId: string, userId: string): Promise<AchievementSelectedFull>  => {
  try {
    const response = await api.get(`/qr-achievements/get-selectedfullUA`, { params: { userId: userId, achievementId: achievementId } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching selected achievements for user ID ${userId} and achievement ID ${achievementId}`, error);
    throw error;
  }
};

export const doneSelectAchievement = async (selectedAchievementId: string) => {
  try {
    const requestBody: { selectedAchievementId: string } = {
      selectedAchievementId: selectedAchievementId,
    };

    const response = await api.post('/qr-achievements/done-selected', requestBody);
    return response.data;
  } catch (error) {
    console.error(`Error in setting done to selected achievement by ID ${selectedAchievementId}:`, error);
    throw error;
  }
};

export const createQrScan = async (qrId: string, userId: string, lon?: number, lat?: number) => {
  try {
    const requestBody: { qrId: string; userId: string; lon?:number; lat?:number } = {
      qrId: qrId,
      userId: userId,
      lon: lon,
      lat: lat
    };

    const response = await api.post('/qr-achievements/create-qrscan', requestBody);
    return response.data;
  } catch (error) {
    console.error(`Error scanning qrcode ID ${qrId}:`, error);
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

export const fetchQrScannedByUser = async (userId: string, achievementId: string) => {
  try {
    const response = await api.get(`/qr-achievements/get-qrscan`, { params: { userId: userId, achievementId: achievementId } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching scanned qr for user ID 
      ${userId} and  achievement Id ${achievementId}:`, error);
    throw error;
  }
};


export const fetchSelectedFullAchievementsByUser = async (userId: string) => {
  try {
    const response = await api.get(`/qr-achievements/get-selectedfull`, { params: { userId: userId } });
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


const TONCENTER_MAINNET_API_URL = 'https://toncenter.com/api/v2';
const TONCENTER_TESTNET_API_URL = 'https://testnet.toncenter.com/api/v2';

export const fetchTonBalance = async (address: string, network: 'mainnet' | 'testnet'): Promise<string> => {
  const apiUrl = network === 'mainnet' ? TONCENTER_MAINNET_API_URL : TONCENTER_TESTNET_API_URL;

  try {
    const response = await axios.get(`${apiUrl}/getAddressBalance`, {
      params: { address },
    });
    const nanoTONs = response.data.result;
    const tonBalance = (parseInt(nanoTONs, 10) / 1e9).toFixed(2); // Convert to TON and format to 2 decimal places
    return tonBalance;
  } catch (error) {
    console.error(`Error fetching ${network} balance:`, error);
    return '0';
  }
};