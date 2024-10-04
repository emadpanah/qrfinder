import axios from 'axios';
import { PiCompassToolDuotone } from 'react-icons/pi';
import {
  QRCode,
  AchievementSelectedFull,
  Balance,
  Campaign,
} from './definitions';

import { CartItem, CustomerSyncModel, CheckoutDto } from './definitions';
import { Types } from 'mongoose';

const iamServiceUrl = process.env.NEXT_PUBLIC_IAM_SERVICE_URL;
const APP_SECRET = process.env.NEXT_PUBLIC_APP_SECRET || 'default_app_secret';

// function getCsrfToken() {
//   console.log("Retrieving CSRF token...");
//   console.log("All cookies: " + document.cookie);
//   const matches = document.cookie.match(new RegExp(
//     '(?:^|; )' + encodeURIComponent('XSRF-TOKEN').replace(/[-.+*]/g, '\\$&') + '=([^;]*)'
//   ));
//   return matches ? decodeURIComponent(matches[1]) : undefined;
// }

// const api = axios.create({
//   baseURL: iamServiceUrl,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use(config => {
//   const csrfToken = getCsrfToken();
//   console.log("CSRF Token: " + csrfToken);
//   if (csrfToken) {
//     config.headers['XSRF-TOKEN'] = csrfToken;
//   }
//   return config;
// }, error => {
//   return Promise.reject(error);
// });

// export default api;

// function getCsrfToken() {
//   const matches = document.cookie.match(new RegExp(
//     '(?:^|; )' + encodeURIComponent('XSRF-TOKEN').replace(/[-.+*]/g, '\\$&') + '=([^;]*)'
//   ));
//   return matches ? decodeURIComponent(matches[1]) : undefined;
// }

// // Create an Axios instance with CSRF token in headers
// const api = axios.create({
//   baseURL: iamServiceUrl,
//   headers: {
//     'Content-Type': 'application/json',
//     'X-CSRF-TOKEN': getCsrfToken(), // Add CSRF token to headers
//   },
// });

export const api = axios.create({
  baseURL: iamServiceUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerUser = async (telegramID: string) => {
  try {
    console.log('register');
    const response = await api.post('/iam/register', {
      _id: new Types.ObjectId(),
      telegramID: telegramID,
      clientSecret: APP_SECRET,
    });

    const { token: authToken, isNewToken, userId } = response.data;
    localStorage.setItem('authToken', authToken);

    return { authToken, isNewToken, userId };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Axios error registering user:',
        error.response?.data || error.message,
      );
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

export const createBalance = async (
  userId: string,
  transactionType: string,
  amount: number,
  currency: string,
  transactionEntityId: string,
  balanceAfterTransaction: number,
) => {
  try {
    const response = await api.post('/balance/addtransaction', {
      userId: userId,
      transactionType: transactionType,
      amount: amount,
      currency: currency,
      transactionEntityId: transactionEntityId,
      balanceAfterTransaction: balanceAfterTransaction,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

export const fetchBalance = async (userId: string, currencyId?: string) => {
  try {
    const response = await api.get('/balance/', {
      params: { userId: userId, currency: currencyId },
    });
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

export const fetchCurrency = async (name: string) => {
  try {
    const response = await api.get('/balance/currencybyname', {
      params: { name: name },
    });
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
    console.log('get campaigns active');
    const response = await api.get('/qr-campaigns/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    throw error;
  }
};

export const fetchCampaignById = async (campaignId: string) => {
  try {
    const response = await api.get(`/qr-campaigns/findbyid`, {
      params: { id: campaignId },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching campaign by ID ${campaignId}:`, error);
    throw error;
  }
};

export const fetchQrCodesByAchievementId = async (achievementId: string) => {
  try {
    console.log('fetchQrCodesByAchievementId');
    const response = await api.get(`/qr-achievements/get-allqrcodes`, {
      params: { achievementId: achievementId },
    });
    return response.data; // as unknown as QRCode[];;
  } catch (error) {
    console.error(
      `Error fetching Qrcodes for achievements ID ${achievementId}:`,
      error,
    );
    throw error;
  }
};

export const fetchAchievementById = async (achievementId: string) => {
  try {
    const response = await api.get(`/qr-achievements/findbyid`, {
      params: { id: achievementId },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching achievement by ID ${achievementId}:`, error);
    throw error;
  }
};

export const fetchAchievementsByCampaignId = async (campaignId: string) => {
  try {
    const response = await api.get(`/qr-achievements/getall`, {
      params: { campaignId: campaignId },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching achievements for campaign ID ${campaignId}:`,
      error,
    );
    throw error;
  }
};

export const fetchAchievementsSelectedByCampaignId = async (
  campaignId: string,
  userId: string,
) => {
  try {
    const response = await api.get(`/qr-achievements/getallbyuser`, {
      params: { campaignId: campaignId, userId: userId },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching achievements selected for campaign ID ${campaignId}: and userId ${userId}`,
      error,
    );
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

export const selectAchievement = async (
  achievementId: string,
  userId: string,
  parentId: string,
): Promise<AchievementSelectedFull> => {
  try {
    const requestBody: {
      achievementId: string;
      userId: string;
      parentId?: string;
    } = {
      achievementId: achievementId,
      userId: userId,
    };
    console.log('p :', parentId);
    if (parentId !== '0') {
      requestBody.parentId = parentId;
    }

    const response = await api.post(
      '/qr-achievements/create-selected',
      requestBody,
    );
    console.log('create-selected', response);
    return response.data;
  } catch (error) {
    console.error(`Error selecting achievement ID ${achievementId}:`, error);
    throw error;
  }
};

export const fetchAchievementSelectFullByUA = async (
  achievementId: string,
  userId: string,
): Promise<AchievementSelectedFull> => {
  try {
    const response = await api.get(`/qr-achievements/get-selectedfullUA`, {
      params: { userId: userId, achievementId: achievementId },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching selected achievements for user ID ${userId} and achievement ID ${achievementId}`,
      error,
    );
    throw error;
  }
};

export const doneSelectAchievement = async (selectedAchievementId: string) => {
  try {
    const requestBody: { selectedAchievementId: string } = {
      selectedAchievementId: selectedAchievementId,
    };

    const response = await api.post(
      '/qr-achievements/done-selected',
      requestBody,
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error in setting done to selected achievement by ID ${selectedAchievementId}:`,
      error,
    );
    throw error;
  }
};

export const createQrScan = async (
  qrId: string,
  userId: string,
  lon?: number,
  lat?: number,
) => {
  try {
    const requestBody: {
      qrId: string;
      userId: string;
      lon?: number;
      lat?: number;
    } = {
      qrId: qrId,
      userId: userId,
      lon: lon,
      lat: lat,
    };

    const response = await api.post(
      '/qr-achievements/create-qrscan',
      requestBody,
    );
    return response.data;
  } catch (error) {
    console.error(`Error scanning qrcode ID ${qrId}:`, error);
    throw error;
  }
};

export const fetchSelectedAchievementsByUser = async (userId: string) => {
  try {
    const response = await api.get(`/qr-achievements/get-selected`, {
      params: { userId: userId },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching selected achievements for user ID ${userId}:`,
      error,
    );
    throw error;
  }
};

export const fetchQrScannedByUser = async (
  userId: string,
  achievementId: string,
) => {
  try {
    const response = await api.get(`/qr-achievements/get-qrscan`, {
      params: { userId: userId, achievementId: achievementId },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching scanned qr for user ID 
      ${userId} and  achievement Id ${achievementId}:`,
      error,
    );
    throw error;
  }
};

export const fetchSelFullAchisRefByUserIdCamId = async (
  userId: string,
  campaignId: string,
) => {
  try {
    const response = await api.get(`/qr-achievements/get-selectedfullref`, {
      params: { userId: userId, campaignId: campaignId },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching selected achievements referrer by user ${userId}:`,
      error,
    );
    throw error;
  }
};

export const fetchSelectedFullAchievementsByUser = async (userId: string) => {
  try {
    const response = await api.get(`/qr-achievements/get-selectedfull`, {
      params: { userId: userId },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching selected achievements for user ID ${userId}:`,
      error,
    );
    throw error;
  }
};

export const unselectAchievement = async (
  achievementId: string,
  userId: string,
) => {
  try {
    console.log('unselectAchievement', achievementId, userId);
    const response = await api.delete('/qr-achievements/delete-selected', {
      data: { achievementId, userId },
    });
    return response.data;
  } catch (error) {
    console.error(`Error unselecting achievement ID ${achievementId}:`, error);
    throw error;
  }
};

export const createCampaign = async (campaignData: Campaign) => {
  try {
    console.log(campaignData);
    const response = await api.post('/qr-campaigns/create', campaignData);
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

const TONCENTER_MAINNET_API_URL = 'https://toncenter.com/api/v2';
const TONCENTER_TESTNET_API_URL = 'https://testnet.toncenter.com/api/v2';

export const fetchTonBalance = async (
  address: string,
  network: 'mainnet' | 'testnet',
): Promise<string> => {
  const apiUrl =
    network === 'mainnet'
      ? TONCENTER_MAINNET_API_URL
      : TONCENTER_TESTNET_API_URL;

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

// Axios instance for shop APIs
const shopServiceUrl = process.env.NEXT_PUBLIC_SHOP_API_DOMAIN; // from .env
const shopApi = axios.create({
  baseURL: shopServiceUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createCustomerSync = async (customerData: {
  name: string;
  familyName: string;
  phoneNumber: string;
  password: string;
  email: string;
  gender: number;
  birthDate: string;
  userId: string;
}) => {
  try {
    console.log('SHOP_API_DOMAIN', process.env.NEXT_PUBLIC_SHOP_API_DOMAIN);
    console.log(
      'NEXT_PUBLIC_APP_BASE_URL',
      process.env.NEXT_PUBLIC_APP_BASE_URL,
    );
    const response = await shopApi.post(
      '/api/CreateCustomerSync', // API endpoint
      {
        ...customerData,
        apiKey: process.env.NEXT_PUBLIC_SHOP_API_SECRECT, // From .env
      },
      {
        headers: { 'x-shop-token': process.env.NEXT_PUBLIC_X_SHOP_TOKEN }, // Token from .env
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error creating customer sync:', error);
    throw error;
  }
};

export const addToCart = async (cartItem: CartItem, shopToken: string) => {
  try {
    const response = await shopApi.post('/shop/addToShoppingCart', cartItem, {
      headers: { 'x-shop-token': shopToken },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const checkout = async (checkoutDto: CheckoutDto, shopToken: string) => {
  try {
    const response = await shopApi.post('/shop/checkout', checkoutDto, {
      headers: { 'x-shop-token': shopToken },
    });
    return response.data;
  } catch (error) {
    console.error('Error during checkout:', error);
    throw error;
  }
};

export const getAllProducts = async (token: string) => {
  try {
    const response = await shopApi.get('/api/GetAllProducts', {
      params: {
        langId: 'f018d2b5-71df-4d1a-9ea4-277811f71c02',
        specCategoryId: '879bc488-2047-4c21-b6ec-7f9a4284cafc',
        pageNumber: 0,
      },
      headers: {
        'x-shop-token': process.env.NEXT_PUBLIC_X_SHOP_TOKEN, // Shop token from .env
        Authorization: `Bearer ${token}`, // Authorization Bearer token
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
