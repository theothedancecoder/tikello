export default function GDPRPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">GDPR Compliance</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights Under GDPR</h2>
          <p className="text-gray-700 mb-4">
            Under the General Data Protection Regulation (GDPR), you have the following rights:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>Right to Access:</strong> You can request a copy of your personal data
            </li>
            <li>
              <strong>Right to Rectification:</strong> You can request corrections to your personal data
            </li>
            <li>
              <strong>Right to Erasure:</strong> You can request deletion of your personal data
            </li>
            <li>
              <strong>Right to Restrict Processing:</strong> You can limit how we use your data
            </li>
            <li>
              <strong>Right to Data Portability:</strong> You can request your data in a machine-readable format
            </li>
            <li>
              <strong>Right to Object:</strong> You can object to our processing of your data
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Process Your Data</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Data Collection</h3>
              <p className="text-gray-700">
                We collect and process your personal data for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2">
                <li>Account creation and management</li>
                <li>Processing ticket purchases</li>
                <li>Event management for organizers</li>
                <li>Customer support</li>
                <li>Marketing communications (with consent)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Legal Basis</h3>
              <p className="text-gray-700">
                We process your data under the following legal bases:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2">
                <li>Contract fulfillment for ticket purchases</li>
                <li>Legal obligations for financial records</li>
                <li>Legitimate interests for platform improvement</li>
                <li>Consent for marketing communications</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Protection Measures</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to ensure data security:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Encryption of personal data</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Staff training on data protection</li>
            <li>Data processing agreements with vendors</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Data Transfers</h2>
          <p className="text-gray-700 mb-4">
            When we transfer data outside the EEA, we ensure appropriate safeguards:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Standard contractual clauses</li>
            <li>Adequacy decisions by the European Commission</li>
            <li>Privacy Shield certification (where applicable)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your data for as long as necessary to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide our services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Choices</h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-700">
              You can exercise your GDPR rights by:
            </p>
            <ul className="list-disc pl-6 text-blue-700 mt-2">
              <li>Using the privacy settings in your account</li>
              <li>Contacting our Data Protection Officer</li>
              <li>Submitting a request through our contact form</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <p className="text-gray-700">
            For any GDPR-related inquiries, contact our Data Protection Officer at{' '}
            <a href="mailto:support-tikello@swaypayment.com" className="text-blue-600 hover:text-blue-800">
              support-tikello@swaypayment.com
            </a>
            {' '}or through our{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-800">
              contact form
            </a>.
          </p>
          <p className="text-gray-700 mt-4">
            You also have the right to lodge a complaint with your local data protection authority.
          </p>
        </section>
      </div>
    </div>
  );
}
