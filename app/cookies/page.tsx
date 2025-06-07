export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
          <p className="text-gray-700 mb-4">
            Cookies are small text files that are stored on your computer or mobile device when you visit 
            our website. They help us provide you with a better experience by:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Remembering your preferences and settings</li>
            <li>Keeping you signed in to your account</li>
            <li>Understanding how you use our website</li>
            <li>Improving our services based on your behavior</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Essential Cookies</h3>
              <p className="text-gray-700">
                Required for the website to function properly. These cannot be disabled.
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2">
                <li>Authentication and security</li>
                <li>Shopping cart functionality</li>
                <li>Basic website operations</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Performance Cookies</h3>
              <p className="text-gray-700">
                Help us understand how visitors interact with our website.
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2">
                <li>Analytics and statistics</li>
                <li>Error monitoring</li>
                <li>Performance measurement</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Functional Cookies</h3>
              <p className="text-gray-700">
                Enable enhanced functionality and personalization.
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2">
                <li>Language preferences</li>
                <li>User preferences</li>
                <li>Location-based content</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Marketing Cookies</h3>
              <p className="text-gray-700">
                Used to deliver relevant advertisements and track their effectiveness.
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2">
                <li>Advertising personalization</li>
                <li>Campaign measurement</li>
                <li>Cross-site tracking</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
          <p className="text-gray-700 mb-4">
            You can control and manage cookies in various ways:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>Browser Settings:</strong> Most web browsers allow you to manage cookies 
              through their settings preferences
            </li>
            <li>
              <strong>Cookie Preferences:</strong> Use our cookie consent manager to customize 
              your preferences
            </li>
            <li>
              <strong>Third-Party Tools:</strong> Various tools and browser extensions can help 
              manage cookies
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use services from these third parties that may set cookies:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Google Analytics (analytics)</li>
            <li>Stripe (payment processing)</li>
            <li>Clerk (authentication)</li>
            <li>Klarna (payment processing)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
          <p className="text-gray-700">
            We may update this Cookie Policy from time to time. Any changes will be posted on this page 
            with an updated revision date. Please check back periodically to stay informed about our use 
            of cookies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions?</h2>
          <p className="text-gray-700">
            If you have any questions about our use of cookies, please contact us at{' '}
            <a href="mailto:support-tikello@swaypayment.com" className="text-blue-600 hover:text-blue-800">
              support-tikello@swaypayment.com
            </a>
            {' '}or through our{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-800">
              contact form
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
