export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Help Center</h1>

      <div className="grid gap-8">
        {/* Quick Links */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#buying-tickets" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">Buying Tickets</h3>
              <p className="text-sm text-gray-500">Learn how to purchase and manage your tickets</p>
            </a>
            <a href="#organizing-events" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">Organizing Events</h3>
              <p className="text-sm text-gray-500">Get started with creating and managing events</p>
            </a>
            <a href="#payments" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">Payments & Refunds</h3>
              <p className="text-sm text-gray-500">Information about payments, fees, and refunds</p>
            </a>
            <a href="#account" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">Account Settings</h3>
              <p className="text-sm text-gray-500">Manage your account and preferences</p>
            </a>
          </div>
        </section>

        {/* Common Questions */}
        <section id="buying-tickets" className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Buying Tickets</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-medium text-gray-900 mb-2">How do I purchase tickets?</h3>
              <p className="text-gray-700">
                Browse events, select your desired tickets, and proceed to checkout. 
                We accept various payment methods including credit cards and installment options through Klarna.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-medium text-gray-900 mb-2">Where are my tickets?</h3>
              <p className="text-gray-700">
                After purchase, your tickets will be available in your account dashboard. 
                You'll also receive a confirmation email with your ticket details.
              </p>
            </div>
          </div>
        </section>

        {/* Organizing Events */}
        <section id="organizing-events" className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Organizing Events</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-medium text-gray-900 mb-2">How do I create an event?</h3>
              <p className="text-gray-700">
                Sign in to your account, go to the organizer dashboard, and click "Create Event". 
                Fill in your event details, set up ticket types, and publish when ready.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-medium text-gray-900 mb-2">Managing ticket sales</h3>
              <p className="text-gray-700">
                Track sales, manage attendees, and handle refunds through your event dashboard. 
                You can also export attendee lists and sales reports.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Need More Help?</h2>
          <p className="text-gray-700 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="mailto:support-tikello@swaypayment.com"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Email Support
            </a>
            <a 
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Contact Form
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
