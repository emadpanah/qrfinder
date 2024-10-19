// app/qrApp/page.tsx
'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CampaignHeader from './components/CampaignHeader';
import CampaignButton from './components/CampaignButton';
import MyAchievements from './components/MyAchievements';
import CampaignDetails from './components/CampaignDetails';
import AchievementDetails from './components/AchievementDetails';
import QRAchievement from './components/QRAchievement';
import {
  AccountType,
  Campaign,
  AchievementSelectedFull,
  Achievement,
  Product,
} from '@/app/lib/definitions';
import {
  fetchActiveCampaigns,
  fetchAchievementSelectFullByUA,
  fetchCampaignById,
  fetchAchievementById,
  selectAchievement,
  createQrScan,
  getAllProducts
} from '@/app/lib/api';
import { useUser } from '@/app/contexts/UserContext';
import styles from './css/qrApp.module.css';
import CampaignInsert from './components/CampaignInsert';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import ProductBasket from './components/ProductBasket';
import ProductCheckout from './components/ProductCheckout';
import { Type } from 'react-toastify/dist/utils';
import { Types } from 'mongoose';

enum ActiveSection {
  Campaigns,
  AchievementDetails,
  CampaignDetails,
  InsertCampaign,
  Shop,
  ProductDetails,
  Basket,
  Checkout,
}

const QRAppPageContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    ActiveSection.Shop,
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [selectedAchievementFull, setSelectedAchievementFull] =
    useState<AchievementSelectedFull | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [basket, setBasket] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // Add this state for loading
  const [parentId, setParentId] = useState<string>();
  const searchParams = useSearchParams();
  const { accountData, userId, updateBalance } = useUser();

  const getCampaigns = async () => {
    try {
      const campaignsData = await fetchActiveCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  useEffect(() => {
    console.log('page.tsx-useEffect');
    setLoading(true);
    const achievementId = searchParams.get('a');
    const type = searchParams.get('t');
    const parentId = searchParams.get('p');
    const chatId = searchParams.get('chatId');

    console.log('a', achievementId);
    console.log('t', type);
    console.log('p', parentId);
    console.log('chatId', chatId);

    // const isQrCodeType = type === 'q';
    // const hasValidParamsQr = !!achievementId && isQrCodeType;

    // const isAchieventInviteType = type === 'a';
    // const hasValidparaInvi = !!achievementId && isAchieventInviteType;

    const isShopCodeType = type === 's'; // New shop type
    //const hasValidParamsShopRef = achievementId && isShopCodeType && parentId;
    if(parentId)
      setParentId(parentId);
    //const hasValidParamsShop = !achievementId && !parentId && !type;

    // // Handle QR code achievement
    // if (hasValidParamsQr) {
    //   if (userId && parentId) {
    //     selectAchievement(achievementId!, userId, '0')
    //       .then((achievement) => {
    //         setSelectedAchievementFull(achievement);
    //         fetchAchievementById(achievement.achievementId)
    //           .then((ach) => {
    //             setSelectedAchievement(ach);
    //             createQrScan(parentId.toString(), userId, 0, 0);
    //             setActiveSection(ActiveSection.AchievementDetails);
    //             setLoading(false);
    //           })
    //           .catch((error) =>
    //             console.error('Error fetching achievement:', error),
    //           );
    //       })
    //       .catch((error) =>
    //         console.error('Error selecting achievement:', error),
    //       );
    //   }
    // }

    // Handle Invite achievement
    // if (hasValidparaInvi) {
    //   if (userId) {
    //     selectAchievement(achievementId!, userId, parentId ? parentId : '0')
    //       .then((select) => {
    //         setSelectedAchievementFull(select);
    //         fetchAchievementById(achievementId!)
    //           .then((achievement) => {
    //             setSelectedAchievement(achievement);
    //             setActiveSection(ActiveSection.AchievementDetails);
    //             setLoading(false);
    //           })
    //           .catch((error) =>
    //             console.error('Error fetching achievement:', error),
    //           );
              
    //       })
    //       .catch((error) =>
    //         console.error('Error selecting achievement:', error),
    //       );
    //   }
    // }

    // New logic for handling shop code type
    if (isShopCodeType) {
      
      console.log("userId - ", userId);
      if (userId) {
        console.log('Loading products from shop section');
        getAllProducts(userId)
          .then((realProducts) => {
            setProducts(realProducts); // Once resolved, set the products
            setActiveSection(ActiveSection.Shop); // Switch to shop section
            setLoading(false);
          })
      }
    }
  }, [ , userId]);

  const handleCampaignClick = async (campaignId: string) => {
    try {
      console.log(`Campaign clicked: ${campaignId}`);
      const campaign = await fetchCampaignById(campaignId);
      console.log(`Fetched campaign: ${campaign.name}`);
      setSelectedCampaign(campaign);
      setActiveSection(ActiveSection.CampaignDetails);
      console.log(
        `Active section set to CampaignDetails with ID: ${campaignId}`,
      );
    } catch (error) {
      console.error(
        `Error fetching campaign details for ID ${campaignId}:`,
        error,
      );
    }
  };

  const handleAchievementClick = (achievementId: string) => {
    fetchAchievementById(achievementId).then((achievement) => {
      setSelectedAchievement(achievement);
      setActiveSection(ActiveSection.AchievementDetails);
    });
  };

  const handleMyAchievementClick = (achievementId: string) => {
    fetchAchievementById(achievementId)
      .then((achievement) => {
        setSelectedAchievement(achievement);
        fetchAchievementSelectFullByUA(achievement._id, userId!).then(
          (select) => {
            setSelectedAchievementFull(select);
            setActiveSection(ActiveSection.AchievementDetails);
          },
        );
      })
      .catch((error) => {
        console.error('Error fetching achievement:', error);
      });
  };

  const handleViewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setActiveSection(ActiveSection.ProductDetails);
  };

  const handleAddToBasket = (product: Product) => {
    setBasket([...basket, product]);
    alert(`${product.base.Title} added to basket`);
  };

  const handleRemoveFromBasket = (productId: string) => {
    setBasket(basket.filter((product) => product.base.Id !== productId));
  };

  const handleCheckout = () => {
    setActiveSection(ActiveSection.Checkout);
  };

  const handleConfirmCheckout = () => {
    alert('Order confirmed!');
    setBasket([]);
    setActiveSection(ActiveSection.Shop);
  };

  const handleBackButtonClick = () => {
    if (
      activeSection === ActiveSection.CampaignDetails ||
      activeSection === ActiveSection.AchievementDetails
    ) {
      setActiveSection(ActiveSection.Shop);
    } else {
      getCampaigns();
      setActiveSection(ActiveSection.Campaigns);
    }
  };
  const handleInsertCampaignClick = () => {
    setActiveSection(ActiveSection.InsertCampaign);
  };

  const handleNavigateToBasket = () => {
    setActiveSection(ActiveSection.Basket); // Navigate to basket
  };

  const handleAddToCart = (product: Product) => {
    // Logic for adding the product to the cart
    setBasket([...basket, product]);
    alert(`${product.base.Title} added to cart`);
  };

  const handleEarnMoney = () => {
    // Achievement ID to select
    console.log("eran : ");
    const achievementId = "670a82e0196204f8d4ff1fa3";
    // Getting the parentId from URL if available
  
    if (userId) {
      // Select the achievement with or without parentId depending on its availability
      const parentParam = parentId ? parentId : '0'; // If parentId exists, use it, otherwise use '0'
  
      console.log("parentId : ", parentId);
      selectAchievement(achievementId, userId, parentParam)
        .then((achievement) => {
          setSelectedAchievementFull(achievement);
          fetchAchievementById(achievementId)
            .then((ach) => {
              setSelectedAchievement(ach);
              setActiveSection(ActiveSection.AchievementDetails);
              updateBalance();
            })
            .catch((error) =>
              console.error('Error fetching achievement:', error),
            );
        })
        .catch((error) =>
          console.error('Error selecting achievement:', error),
        );
    } else {
      console.error('User not logged in');
    }
  };
  
  

  const renderActiveSection = () => {
    if (loading) {
      return (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingText}>Please wait . . .</div>
        </div>
      );
    }
    console.log(`Rendering section: ${activeSection}`);
    switch (activeSection) {
      case ActiveSection.Campaigns:
        return (
          <div className={styles.campaignListContainer}>
            <div className="flex w-full items-center justify-between">
              <p className="text-s pb-2 pt-4">New Campaigns</p>
              <div className="flex justify-end ">
                <button
                  className="rounded bg-green-500 px-2 pb-1 text-xl text-white"
                  onClick={handleInsertCampaignClick}
                >
                  +
                </button>
              </div>
            </div>
            <div
              className={`${styles.container} ${styles.spaceY4} pt-2 md:pt-4 lg:pt-8 ${styles.campaignList}`}
            >
              {campaigns.map((campaign) => (
                <CampaignButton
                  key={campaign._id}
                  campaign={campaign}
                  onClick={handleCampaignClick}
                />
              ))}
            </div>
            <MyAchievements onAchievementClick={handleMyAchievementClick} />
          </div>
        );
      case ActiveSection.InsertCampaign:
        return (
          <CampaignInsert
            onInsertSuccess={() => setActiveSection(ActiveSection.Campaigns)}
          />
        );
      case ActiveSection.AchievementDetails:
        return selectedAchievement?._id ? (
          <AchievementDetails
            achievement={selectedAchievement!}
            onBack={handleBackButtonClick}
          />
        ) : null;
      case ActiveSection.CampaignDetails:
        return selectedCampaign?._id ? (
          <CampaignDetails
            campaignId={selectedCampaign._id}
            onAchievementClick={handleAchievementClick}
            onBack={handleBackButtonClick}
          />
        ) : null;
      case ActiveSection.Shop:
        return (
          <ProductList
            onEarnMoney={handleEarnMoney}
            products={products}
            onAddToCart={handleAddToBasket}
            onNavigateToBasket={handleNavigateToBasket}
          />
        );
      case ActiveSection.ProductDetails:
        return selectedProduct ? (
          <ProductDetails
            product={selectedProduct}
            onBack={() => setActiveSection(ActiveSection.Shop)}
            onAddToBasket={handleAddToBasket}
            onNavigateToBasket={handleNavigateToBasket}
          />
        ) : null;
      case ActiveSection.Basket:
        return (
          <ProductBasket
            basket={basket}
            onCheckout={handleCheckout}
            onRemoveFromBasket={handleRemoveFromBasket}
          />
        );
      case ActiveSection.Checkout:
        return (
          <ProductCheckout
            onConfirmCheckout={handleConfirmCheckout}
            onCancel={() => setActiveSection(ActiveSection.Basket)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex h-full flex-col before:from-white after:from-sky-200 `}
    >
      <CampaignHeader onBack={handleBackButtonClick} />
      <div className="flex flex-1 flex-col items-center justify-center">
        {renderActiveSection()}
      </div>
    </div>
  );
};

const QRAppPage: React.FC = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <QRAppPageContent />
  </Suspense>
);

export default QRAppPage;


