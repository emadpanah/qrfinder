// app/qrApp/components/MyAchievements.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Achievement } from '@/app/lib/definitions';

const MyAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await axios.get('/api/my-achievements'); // Replace with your actual API endpoint
        setAchievements(response.data);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Achievements</h1>
      <ul className="list-disc pl-6">
        {achievements.map((achievement) => (
          <li key={achievement.id}>
            <h2 className="text-xl font-semibold">{achievement.name}</h2>
            <p>{achievement.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyAchievements;
