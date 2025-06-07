export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Pricing</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <div className="bg-blue-50 rounded-lg shadow-lg p-6 border-2 border-blue-500">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm inline-block mb-4">Most Popular</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic</h2>
          <p className="text-4xl font-bold mb-6">2%</p>
          <p className="text-sm text-gray-500 mb-2">+ Stripe processing fee</p>
          <p className="text-gray-600 mb-6">Pay as you go - Perfect for all event organizers</p>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              No monthly fees
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Unlimited events
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Basic analytics
            </li>
          </ul>

          <a href="/seller" className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition-colors inline-block text-center">
            Get Started
          </a>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Enterprise</h2>
          <p className="text-4xl font-bold mb-6">Custom</p>
          <p className="text-gray-600 mb-6">For large-scale event organizers</p>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Custom pricing model
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Custom integration
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Dedicated support
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Volume discounts
            </li>
          </ul>

          <button className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">All Plans Include</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Core Features</h4>
            <ul className="space-y-2 text-gray-600">
              <li>Unlimited ticket types</li>
              <li>Mobile-optimized tickets</li>
              <li>Real-time sales tracking</li>
              <li>Live queue system</li>
              <li>Secure payment processing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Support</h4>
            <ul className="space-y-2 text-gray-600">
              <li>24/7 email support</li>
              <li>Help center access</li>
              <li>Community forums (coming soon)</li>
              <li>Video tutorials (coming soon)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Security</h4>
            <ul className="space-y-2 text-gray-600">
              <li>SSL encryption</li>
              <li>Fraud prevention</li>
              <li>GDPR compliance</li>
              <li>Regular backups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
