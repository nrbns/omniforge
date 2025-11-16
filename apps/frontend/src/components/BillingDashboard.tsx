'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BillingDashboardProps {
  userId: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: Record<string, number>;
}

export default function BillingDashboard({ userId }: BillingDashboardProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
    fetchCurrentPlan();
    fetchUsage();
  }, [userId]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/billing/plans`,
      );
      if (!response.ok) throw new Error('Failed to fetch plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPlan = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/billing/user/${userId}/plan`,
      );
      if (!response.ok) throw new Error('Failed to fetch plan');
      const data = await response.json();
      setCurrentPlan(data);
    } catch (error) {
      // Ignore errors
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/billing/user/${userId}/usage`,
      );
      if (!response.ok) throw new Error('Failed to fetch usage');
      const data = await response.json();
      setUsage(data);
    } catch (error) {
      // Ignore errors
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/billing/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, planId }),
        },
      );
      if (!response.ok) throw new Error('Failed to subscribe');
      toast.success(`Subscribed to ${planId} plan!`);
      fetchCurrentPlan();
    } catch (error) {
      toast.error('Failed to subscribe');
    }
  };

  if (loading) {
    return <div className="p-6">Loading billing...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Billing & Plans</h1>

      {/* Current Plan */}
      {currentPlan && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{currentPlan.name}</div>
              <div className="text-gray-600">
                ${(currentPlan.price / 100).toFixed(2)}/month
              </div>
            </div>
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">Active</div>
          </div>
        </div>
      )}

      {/* Usage Stats */}
      {usage && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Usage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Ideas</div>
              <div className="text-xl font-bold">{usage.ideas || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Builds</div>
              <div className="text-xl font-bold">{usage.builds || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Agents</div>
              <div className="text-xl font-bold">{usage.agents || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Storage</div>
              <div className="text-xl font-bold">{usage.storage || 0} MB</div>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-6 ${
                currentPlan?.id === plan.id ? 'border-purple-500 bg-purple-50' : ''
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold mb-4">
                ${(plan.price / 100).toFixed(2)}
                <span className="text-sm text-gray-600">/month</span>
              </div>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={currentPlan?.id === plan.id}
                className={`w-full px-4 py-2 rounded-lg font-medium ${
                  currentPlan?.id === plan.id
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : plan.price === 0
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {currentPlan?.id === plan.id ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

