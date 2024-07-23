// app/qrApp/components/MyAchievements.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Achievement } from '@/app/lib/definitions';
import { useUser } from '@/app/contexts/UserContext';
import AchievementComponent from './Achievements';
import styles from '../css/qrApp.module.css';

const MyAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { userId } = useUser(); // Use userId from UserContext

  useEffect(() => {
    const fetchAchievements = async () => {
      if (userId) {
        try {
          const response = await axios.get('/api/my-achievements', {
            params: { userId }, // Pass the userId as a query parameter
          });
          setAchievements(response.data);
        } catch (error) {
          console.error('Error fetching achievements:', error);
        }
      }
    };

    fetchAchievements();
  }, [userId]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Achievements</h1>
      <ul className="list-disc pl-6">
        <AchievementComponent achievements={achievements} userId={userId || ''} />
      </ul>
    </div>
  );
};

export default MyAchievements;
