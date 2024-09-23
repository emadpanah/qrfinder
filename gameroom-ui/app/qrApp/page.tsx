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
import { AccountType, Campaign, AchievementSelectedFull, Achievement, Product } from '@/app/lib/definitions';
import { fetchActiveCampaigns, fetchAchievementSelectFullByUA, fetchCampaignById, fetchAchievementById, selectAchievement, createQrScan } from '@/app/lib/api';
import { useUser } from '@/app/contexts/UserContext';
import styles from './css/qrApp.module.css';
import CampaignInsert from './components/CampaignInsert';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import ProductBasket from './components/ProductBasket';
import ProductCheckout from './components/ProductCheckout';

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
  const [activeSection, setActiveSection] = useState<ActiveSection>(ActiveSection.Campaigns);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedAchievementFull, setSelectedAchievementFull] = useState<AchievementSelectedFull | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [basket, setBasket] = useState<Product[]>([]);

  const searchParams = useSearchParams();
  const { accountData, userId } = useUser();

  // useEffect(() => {
  //   const getCampaigns = async () => {
  //     try {
  //       const campaignsData = await fetchActiveCampaigns();
  //       setCampaigns(campaignsData);
  //     } catch (error) {
  //       console.error('Error fetching campaigns:', error);
  //     }
  //   };
  //   getCampaigns();
  // }, []);

  // useEffect(() => {
  //   const achievementId = searchParams.get('a');
  //   const type = searchParams.get('t');
  //   const parentId = searchParams.get('p');
  //   const isQrCodeType = type === 'q';
  //   const hasValidParamsQr = !!achievementId && isQrCodeType;
  //   const isAchieventInviteType = type === 'a';
  //   const hasValidparaInvi = !!achievementId && isAchieventInviteType;
  //   if (hasValidParamsQr) {
  //     if (accountData.address && userId && parentId) {

  //       console.log("User connected with address:", accountData.address);
  //       selectAchievement(achievementId!, userId, "0").then((achievement) => {
  //         setSelectedAchievementFull(achievement);
  //         fetchAchievementById(achievement.achievementId).then((ach) => {
  //           setSelectedAchievement(ach);
  //           createQrScan(parentId.toString(), userId, 0, 0);
  //           setActiveSection(ActiveSection.AchievementDetails);
  //         }).catch((error) => {
  //           console.error('Error fetching achievement:', error);
  //         });
  //       }).catch((error) => {
  //         console.error('Error selecting achievement:', error);
  //       });
  //     }
  //   }
  //   if (hasValidparaInvi) {
  //     alert("hasValidparaInvi address :"+ accountData.address+" userId : "+ userId);
  //     if (accountData.address && userId) {
  //       console.log("User connected with address:", accountData.address);
  //       selectAchievement(achievementId!, userId, parentId ? parentId : '0').then((select) => {
  //         setSelectedAchievementFull(select);
  //         fetchAchievementById(achievementId!).then((achievement) => {
  //           setSelectedAchievement(achievement);
  //           setActiveSection(ActiveSection.AchievementDetails);
  //         }).catch((error) => {
  //           console.error('Error fetching achievement:', error);
  //         });
  //       }).catch((error) => {
  //         console.error('Error selecting achievement:', error);
  //       });
  //     }
  //   }
  // }, [searchParams, accountData.address, userId]);

  useEffect(() => {
    const achievementId = searchParams.get('a');
    const type = searchParams.get('t');
    const parentId = searchParams.get('p');
    
    const isQrCodeType = type === 'q';
    const hasValidParamsQr = !!achievementId && isQrCodeType;
    
    const isAchieventInviteType = type === 'a';
    const hasValidparaInvi = !!achievementId && isAchieventInviteType;

    const isShopCodeType = type === 's';  // New shop type
    const hasValidParamsShop = !!achievementId && isShopCodeType;

    // Handle QR code achievement
    if (hasValidParamsQr) {
      if (accountData.address && userId && parentId) {
        selectAchievement(achievementId!, userId, "0").then((achievement) => {
          setSelectedAchievementFull(achievement);
          fetchAchievementById(achievement.achievementId).then((ach) => {
            setSelectedAchievement(ach);
            createQrScan(parentId.toString(), userId, 0, 0);
            setActiveSection(ActiveSection.AchievementDetails);
          }).catch((error) => console.error('Error fetching achievement:', error));
        }).catch((error) => console.error('Error selecting achievement:', error));
      }
    }

    // Handle Invite achievement
    if (hasValidparaInvi) {
      if (accountData.address && userId) {
        selectAchievement(achievementId!, userId, parentId ? parentId : '0').then((select) => {
          setSelectedAchievementFull(select);
          fetchAchievementById(achievementId!).then((achievement) => {
            setSelectedAchievement(achievement);
            setActiveSection(ActiveSection.AchievementDetails);
          }).catch((error) => console.error('Error fetching achievement:', error));
        }).catch((error) => console.error('Error selecting achievement:', error));
      }
    }

    // New logic for handling shop code type
    if (hasValidParamsShop) {
      if (accountData.address && userId) {
        console.log("Loading fake products for shop section");
        const fakeProducts: Product[] = [
          {
            Base: {
              Id: '1',
              MaxCountInCart: 10,
              Sort: 1,
              ReleaseDaysCount: 0,
              HourOfRelease: 0,
              MinuteOfRelease: 0,
              JustInCart: false,
              Title: 'Sample Product 1',
              Slogan: 'The best product',
              Description: 'This is a sample product',
              InternationalCodeValue: 'ABC123',
              AdditionalDescription: 'Additional description for product 1',
              AdditionalValue: 'Additional value 1',
              ImagesIds: 'image1,image2',
              Quantity: 5,
              IsLastQuantity: false,
              UserName: 'admin',
            },
            IsAvailable: true,
            SmallImage: 'https://via.placeholder.com/150',
          },
          {
            Base: {
              Id: '2',
              MaxCountInCart: 20,
              Sort: 2,
              ReleaseDaysCount: 1,
              HourOfRelease: 10,
              MinuteOfRelease: 30,
              JustInCart: false,
              Title: 'Sample Product 2',
              Slogan: 'Another great product',
              Description: 'Another sample product',
              InternationalCodeValue: 'DEF456',
              AdditionalDescription: 'Additional description for product 2',
              AdditionalValue: 'Additional value 2',
              ImagesIds: 'image3,image4',
              Quantity: 10,
              IsLastQuantity: false,
              UserName: 'admin',
            },
            IsAvailable: true,
            SmallImage: 'https://via.placeholder.com/150',
          },
        ];
        setProducts(fakeProducts); // Set fake products
        setActiveSection(ActiveSection.Shop); // Switch to shop section
      }
    }
  }, [searchParams, accountData.address, userId]);


  const handleCampaignClick = async (campaignId: string) => {
    try {
      console.log(`Campaign clicked: ${campaignId}`);
      const campaign = await fetchCampaignById(campaignId);
      console.log(`Fetched campaign: ${campaign.name}`);
      setSelectedCampaign(campaign);
      setActiveSection(ActiveSection.CampaignDetails);
      console.log(`Active section set to CampaignDetails with ID: ${campaignId}`);
    } catch (error) {
      console.error(`Error fetching campaign details for ID ${campaignId}:`, error);
    }
  };

  const handleAchievementClick = (achievementId: string) => {
    fetchAchievementById(achievementId).then((achievement) => {
      setSelectedAchievement(achievement);
      setActiveSection(ActiveSection.AchievementDetails);
    });
  };

  const handleMyAchievementClick = (achievementId: string) => {
    fetchAchievementById(achievementId).then((achievement) => {
      setSelectedAchievement(achievement);
      fetchAchievementSelectFullByUA(achievement._id, userId!).then((select) => {
        setSelectedAchievementFull(select);
        setActiveSection(ActiveSection.AchievementDetails);
      });
    }).catch((error) => {
      console.error('Error fetching achievement:', error);
    });
  };

  const handleViewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setActiveSection(ActiveSection.ProductDetails);
  };

  const handleAddToBasket = (product: Product) => {
    setBasket([...basket, product]);
    alert(`${product.Base.Title} added to basket`);
  };

  const handleRemoveFromBasket = (productId: string) => {
    setBasket(basket.filter((product) => product.Base.Id !== productId));
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
    if (activeSection === ActiveSection.CampaignDetails || activeSection === ActiveSection.AchievementDetails) {
      setActiveSection(ActiveSection.Campaigns);
    } else {
      setActiveSection(ActiveSection.Campaigns);
    }
  };
  const handleInsertCampaignClick = () => {
    setActiveSection(ActiveSection.InsertCampaign);
  };

  const handleNavigateToBasket = () => {
    setActiveSection(ActiveSection.Basket); // Navigate to basket
  };

  const renderActiveSection = () => {
    console.log(`Rendering section: ${activeSection}`);
    switch (activeSection) {
      case ActiveSection.Campaigns:
        return (
          <div className={styles.campaignListContainer}>
             <div className="flex justify-between items-center w-full">
              <p className="text-s pt-4 pb-2">New Campaigns</p>
              <div className="flex justify-end ">
                <button
                  className="bg-green-500 text-xl text-white px-2 pb-1 rounded"
                  onClick={handleInsertCampaignClick}
                >
                  +
                </button>
              </div>
            </div>
            <div className={`${styles.container} ${styles.spaceY4} pt-2 md:pt-4 lg:pt-8 ${styles.campaignList}`}>
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
        <CampaignInsert onInsertSuccess={() => setActiveSection(ActiveSection.Campaigns)} />
      );
      case ActiveSection.AchievementDetails:
        return selectedAchievement?._id ? <AchievementDetails achievement={selectedAchievement!} onBack={handleBackButtonClick} /> : null;
      case ActiveSection.CampaignDetails:
        return selectedCampaign?._id ? <CampaignDetails campaignId={selectedCampaign._id} onAchievementClick={handleAchievementClick} onBack={handleBackButtonClick} /> : null;
        case ActiveSection.Shop:
          return <ProductList products={products} onViewDetails={handleViewProductDetails} onNavigateToBasket={handleNavigateToBasket}/>;
          case ActiveSection.ProductDetails:
            return selectedProduct ? <ProductDetails product={selectedProduct}  onBack={() => setActiveSection(ActiveSection.Shop)} onAddToBasket={handleAddToBasket} onNavigateToBasket={handleNavigateToBasket} /> : null;
          case ActiveSection.Basket:
            return <ProductBasket basket={basket} onCheckout={handleCheckout} onRemoveFromBasket={handleRemoveFromBasket} />;
          case ActiveSection.Checkout:
            return <ProductCheckout onConfirmCheckout={handleConfirmCheckout} onCancel={() => setActiveSection(ActiveSection.Basket)} />;
          default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col before:from-white after:from-sky-200 `}>
      <CampaignHeader onBack={handleBackButtonClick} />
      <div className="flex flex-col flex-1 justify-center items-center">
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
