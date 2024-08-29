// app/page.tsx
import GameAppLink from './publicUI/components/GameAppLink';

const HomePage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to Our Decentralized Product Engagement Platform</h1>
      <p className="mb-4">Our platform revolutionizes the way users interact with products and brands. Through blockchain technology and smart contracts, we provide a transparent and trustless ecosystem where users can engage with products directly, earn rewards, and participate in governance.</p>
      <div className="flex space-x-4">
        <GameAppLink />
      </div>
    </div>
  );
};

export default HomePage;