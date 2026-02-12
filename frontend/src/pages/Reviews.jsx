import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get('https://trustracapitaltrade-backend.onrender.com');
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews", err);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Customer Reviews</h1>
      <div className="grid gap-6">
        {reviews.length > 0 ? reviews.map((r, i) => (
          <div key={i} className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-indigo-400 font-bold">Rating: {r.rating}/5</p>
            <p className="mt-2 text-gray-300 italic">"{r.comment}"</p>
          </div>
        )) : <p>No reviews yet.</p>}
      </div>
    </div>
  );
}

