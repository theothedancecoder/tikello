export default function FAQPage() {
  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What is Tikello?",
          answer: "Tikello is a comprehensive event ticketing platform that allows organizers to create and manage events while providing attendees with a seamless ticket purchasing experience."
        },
        {
          question: "How do I create an account?",
          answer: "Click 'Sign In' in the top right corner and follow the registration process. You can sign up with your email or use social login options."
        }
      ]
    },
    {
      category: "Buying Tickets",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, and offer installment payments through Klarna for eligible purchases."
        },
        {
          question: "Can I get a refund for my tickets?",
          answer: "Refund policies are set by individual event organizers. Check the event details or contact the organizer directly for their specific refund policy."
        },
        {
          question: "How will I receive my tickets?",
          answer: "Digital tickets are delivered to your email and are also available in your account dashboard. You can access them anytime through our mobile-friendly platform."
        }
      ]
    },
    {
      category: "Event Organizers",
      questions: [
        {
          question: "How much does it cost to create an event?",
          answer: "Creating an event is free. We charge a small service fee on each ticket sold, which includes payment processing and platform usage."
        },
        {
          question: "When do I receive payment for ticket sales?",
          answer: "Payments are processed through Stripe and typically transferred to your account within 2-7 business days after the event."
        },
        {
          question: "Can I customize my event page?",
          answer: "Yes! You can add event descriptions, images, multiple ticket types, and set various pricing options to create an engaging event page."
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>

      <div className="space-y-8">
        {faqs.map((category, categoryIndex) => (
          <section key={categoryIndex} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{category.category}</h2>
            <div className="space-y-6">
              {category.questions.map((faq, faqIndex) => (
                <div key={faqIndex} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Still have questions?</h2>
        <p className="text-blue-700 mb-4">
          Can't find the answer you're looking for? Our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="/contact"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Contact Support
          </a>
          <a 
            href="/help"
            className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-base font-medium text-blue-700 bg-white hover:bg-blue-50"
          >
            Visit Help Center
          </a>
        </div>
      </div>
    </div>
  );
}
