import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Organizer Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                For Organizers
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="/seller/new-event" className="text-base text-gray-500 hover:text-gray-900">
                    Create Event
                  </Link>
                </li>
                <li>
                  <Link href="/seller" className="text-base text-gray-500 hover:text-gray-900">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/seller/events" className="text-base text-gray-500 hover:text-gray-900">
                    Manage Events
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-base text-gray-500 hover:text-gray-900">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                Support
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="/help" className="text-base text-gray-500 hover:text-gray-900">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-base text-gray-500 hover:text-gray-900">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/refunds" className="text-base text-gray-500 hover:text-gray-900">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                Legal
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-base text-gray-500 hover:text-gray-900">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/gdpr" className="text-base text-gray-500 hover:text-gray-900">
                    GDPR Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="text-center">
              <p className="text-base text-gray-400 mb-2">
                &copy; {new Date().getFullYear()} Tikello – a service by Swaypay AS
              </p>
              <p className="text-sm text-gray-400">
                Org.nr: 925 408 352 | Møllergata 9, Oslo, Norway
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
