export default function RefundsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">General Refund Policy</h2>
          <p className="text-gray-700 mb-4">
            When purchasing tickets, the Buyer accepts that any refund amount will be the ticket price excluding 
            all service fees (platform fees). Service fees are non-refundable. Individual event organizers may 
            set additional refund terms and conditions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Request a Refund</h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>Check the event's specific refund policy on the event page</li>
            <li>Contact the event organizer directly through their event page</li>
            <li>If the organizer is unresponsive, contact our support team</li>
            <li>Provide your order number and reason for the refund request</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Processing</h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <p className="text-blue-700">
              <strong>Processing Time:</strong> Approved refunds typically take 5-10 business days 
              to appear in your original payment method.
            </p>
          </div>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Refunds are processed to the original payment method</li>
            <li>All service fees (platform fees) are non-refundable</li>
            <li>Installment payments through Klarna follow their specific refund process</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Event Cancellation</h2>
          <p className="text-gray-700 mb-4">
            If an event is cancelled by the organizer:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Refunds (excluding service fees) are typically processed automatically</li>
            <li>You will receive an email notification about the cancellation</li>
            <li>Refunds will be processed within 5-10 business days</li>
            <li>Service fees are not refundable, even for cancelled events</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
          <p className="text-gray-700 mb-4">
            If you have a dispute regarding a refund:
          </p>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>First, try to resolve the issue directly with the event organizer</li>
            <li>If unsuccessful, contact our support team with full details</li>
            <li>We will mediate between you and the organizer when possible</li>
            <li>For payment disputes, you may also contact your bank or credit card company</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <p className="text-gray-700">
            For refund-related questions or assistance, please contact us at{' '}
            <a href="mailto:support-tikello@swaypayment.com" className="text-blue-600 hover:text-blue-800">
              support-tikello@swaypayment.com
            </a>
            {' '}or use our{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-800">
              contact form
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
