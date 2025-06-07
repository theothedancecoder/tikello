export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect information you provide directly to us, such as when you create an account, 
            purchase tickets, or contact us for support.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Personal information (name, email address, phone number)</li>
            <li>Payment information (processed securely through Stripe)</li>
            <li>Event preferences and purchase history</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>To process ticket purchases and provide event services</li>
            <li>To send you important updates about your tickets and events</li>
            <li>To improve our platform and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            except as described in this policy:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>With event organizers for events you purchase tickets to</li>
            <li>With service providers who assist us in operating our platform</li>
            <li>When required by law or to protect our rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support-tikello@swaypayment.com" className="text-blue-600 hover:text-blue-800">
              support-tikello@swaypayment.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
