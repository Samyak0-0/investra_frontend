'use client';

import { useState } from 'react';

interface PortfolioProps {
  userId: string;
}

export default function Portfolio({ userId }: PortfolioProps) {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`http://localhost:5000/api/user/portfolio/add/${symbol}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, quantity: Number(quantity) }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Stock added successfully');
        setSymbol('');
        setQuantity('');
      } else {
        setMessage(data.error || 'Failed to add stock');
      }
    } catch {
      setMessage('Server error');
    }
  };

  const fetchPortfolio = async () => {
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/user/portfolio/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await res.json();

      if (res.ok) {
        setPortfolio(data);
      } else {
        setMessage(data.error || 'Failed to fetch portfolio');
      }
    } catch {
      setMessage('Server error');
    }
  };

  return (
    <div>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Stock symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <button type="submit">Add Stock</button>
      </form>

      <button onClick={fetchPortfolio}>View Portfolio</button>

      {message && <p>{message}</p>}

      <ul>
        {portfolio.map((item, i) => (
          <li key={i}>
            {item.stock_name || item.stock?.name}: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
