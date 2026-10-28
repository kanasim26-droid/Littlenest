import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronRight, BookOpen, Ruler, Truck, ShieldCheck, HelpCircle } from 'lucide-react';

interface StaticPagesProps {
  pageType: 
    | 'about' 
    | 'contact' 
    | 'faq' 
    | 'size-guide' 
    | 'shipping-policy' 
    | 'returns-policy' 
    | 'privacy-policy' 
    | 'terms' 
    | 'blog';
  onNavigate: (path: string) => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ pageType, onNavigate }) => {
  const { settings } = useStore();
  const [contactSent, setContactSent] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const brandName = settings?.brandName || 'Little Nest';
  const contactEmailAddress = settings?.contactEmail || 'care@littlenest.pk';
  const supportPhone = settings?.supportPhone || '+92 300 8765432';

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    setTimeout(() => setContactSent(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* 1. ABOUT US */}
      {pageType === 'about' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="border-b border-[#E8DCCB] pb-6">
            <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">Our Heritage & Promise</span>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-medium text-[#4A3B32] mt-1">About {brandName}</h1>
          </div>

          <div className="prose prose-stone text-sm text-[#665449] leading-relaxed space-y-4">
            <p className="text-base text-[#4A3B32] font-medium leading-relaxed">
              Little Nest was founded with a gentle, steadfast mission: to curate heirloom-quality, certified non-toxic newborn apparel for families across Pakistan without exorbitant boutique markups.
            </p>
            <p>
              When a new baby arrives, parents are navigating a tender, beautiful world filled with sleepless nights and profound love. We believe that what touches your baby's skin should be completely pure. Newborn skin is delicate, highly permeable, and up to 30% thinner than adult skin.
            </p>
            <p>
              By partnering directly with specialized babywear artisans and textile mills, we eliminate unnecessary middlemen. Every ribbed romper, double-gauze bamboo swaddle, and cable-knit bootie is tested for skin-contact gentleness, tagless comfort, smooth seams, and nickel-free snap poppers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-6 bg-white rounded-2xl border border-[#E8DCCB]">
              <h4 className="font-serif-luxury text-lg text-[#4A3B32] mb-1">GOTS Organic</h4>
              <p className="text-xs text-[#8A7569]">Natural cotton fibers grown without synthetic pesticides or harsh formaldehyde coatings.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-[#E8DCCB]">
              <h4 className="font-serif-luxury text-lg text-[#4A3B32] mb-1">Direct Logistics</h4>
              <p className="text-xs text-[#8A7569]">Dropshipping fulfillment delivers curated international quality directly to your doorstep in Pakistan.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-[#E8DCCB]">
              <h4 className="font-serif-luxury text-lg text-[#4A3B32] mb-1">Parent Care</h4>
              <p className="text-xs text-[#8A7569]">Support via WhatsApp, simple Cash on Delivery (COD), and 14-day unworn exchanges.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTACT US */}
      {pageType === 'contact' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="border-b border-[#E8DCCB] pb-6">
            <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">Parent Support</span>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-medium text-[#4A3B32] mt-1">Get in Touch with Us</h1>
            <p className="text-xs sm:text-sm text-[#735F53] mt-1">
              Have questions regarding baby clothing sizes, delivery timelines, or order tracking? We are here to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Direct Info */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] space-y-4">
                <h4 className="font-serif-luxury text-xl text-[#4A3B32]">Support Channels</h4>
                <div className="space-y-3 text-xs text-[#665449]">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#8A7569]" />
                    <div>
                      <span className="block text-[#8A7569]">Email Inquiries</span>
                      <a href={`mailto:${contactEmailAddress}`} className="font-medium text-[#4A3B32] hover:underline">
                        {contactEmailAddress}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#8A7569]" />
                    <div>
                      <span className="block text-[#8A7569]">Phone & WhatsApp</span>
                      <a href={`tel:${supportPhone}`} className="font-medium text-[#4A3B32] hover:underline">
                        {supportPhone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#8A7569]" />
                    <div>
                      <span className="block text-[#8A7569]">Distribution Center</span>
                      <span className="font-medium text-[#4A3B32]">Lahore & Karachi Logistics Hubs, Pakistan</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF3EB] border border-[#E8DCCB] text-xs text-[#665449]">
                <strong className="block text-[#4A3B32] mb-1">Customer Support Hours:</strong>
                <p>Monday to Saturday: 9:00 AM – 7:00 PM PKT</p>
                <p>Urgent order inquiries on WhatsApp are answered 7 days a week.</p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DCCB]">
              <h4 className="font-serif-luxury text-xl text-[#4A3B32] mb-4">Send a Note</h4>
              {contactSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                  <strong className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Message Received!
                  </strong>
                  <p>Our nursery care team will reply to your email within 2-4 business hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3B32] mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sana Tariq"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3B32] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="sana@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3B32] mb-1">Message *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="How can we help you with baby clothing sizes or order queries?"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#5A463C] text-white text-xs font-medium rounded-lg hover:bg-[#43332B] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SIZE GUIDE */}
      {pageType === 'size-guide' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="border-b border-[#E8DCCB] pb-6">
            <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">Fit & Comfort</span>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-medium text-[#4A3B32] mt-1">Newborn Clothing Size Chart</h1>
            <p className="text-xs sm:text-sm text-[#735F53] mt-1">
              Babies grow quickly during the first months. If your baby is between sizes, we recommend sizing up.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DCCB] overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#FAF3EB] border-b border-[#E8DCCB] text-[#5A463C]">
                <tr>
                  <th className="p-3.5 font-semibold">Clothing Size</th>
                  <th className="p-3.5 font-semibold">Typical Age Range</th>
                  <th className="p-3.5 font-semibold">Baby Length / Height</th>
                  <th className="p-3.5 font-semibold">Baby Weight (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/60 text-[#665449]">
                <tr>
                  <td className="p-3.5 font-medium text-[#4A3B32]">Newborn (NB)</td>
                  <td className="p-3.5">0 – 4 Weeks</td>
                  <td className="p-3.5">Up to 52 cm (20.5 in)</td>
                  <td className="p-3.5">2.5 – 3.8 kg (5.5 – 8.5 lbs)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-[#4A3B32]">0 – 3 Months</td>
                  <td className="p-3.5">1 – 3 Months</td>
                  <td className="p-3.5">52 – 60 cm (20.5 – 23.5 in)</td>
                  <td className="p-3.5">3.8 – 5.5 kg (8.5 – 12 lbs)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-[#4A3B32]">3 – 6 Months</td>
                  <td className="p-3.5">3 – 6 Months</td>
                  <td className="p-3.5">60 – 68 cm (23.5 – 26.8 in)</td>
                  <td className="p-3.5">5.5 – 7.5 kg (12 – 16.5 lbs)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-[#4A3B32]">6 – 12 Months</td>
                  <td className="p-3.5">6 – 12 Months</td>
                  <td className="p-3.5">68 – 76 cm (26.8 – 30 in)</td>
                  <td className="p-3.5">7.5 – 9.8 kg (16.5 – 21.5 lbs)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#FAF3EB] p-6 rounded-2xl border border-[#E8DCCB] space-y-2 text-xs text-[#665449]">
            <strong className="block text-[#4A3B32] font-semibold">Measuring Tips for Newborns:</strong>
            <p>1. Length: Measure from the top of your baby's head to the heel of their foot while lying comfortably flat.</p>
            <p>2. Weight: Weight is the most accurate indicator of fit for newborn bodysuits and rompers.</p>
            <p>3. Diaper Ease: All Little Nest ribbed rompers feature 2-way stretch and generous gusset room to accommodate disposable or cloth diapers comfortably.</p>
          </div>
        </div>
      )}

      {/* 4. SHIPPING POLICY */}
      {pageType === 'shipping-policy' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="border-b border-[#E8DCCB] pb-6">
            <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">Logistics & Delivery</span>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-medium text-[#4A3B32] mt-1">Shipping & Courier Policy</h1>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DCCB] space-y-5 text-xs text-[#665449] leading-relaxed">
            <div>
              <h3 className="text-base font-semibold text-[#4A3B32] mb-1.5">1. Delivery Zones & Couriers</h3>
              <p>We deliver nationwide across Pakistan via authorized courier networks including TCS Express, Leopard Courier, and Trax. Delivery is available to all major cities, towns, and verified postal areas in Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad, Azad Kashmir, and Gilgit-Baltistan.</p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#4A3B32] mb-1.5">2. Shipping Fees & Free Delivery Threshold</h3>
              <p>Standard delivery charge across Pakistan is a flat <strong>Rs. 250</strong>. Orders containing a cart subtotal of <strong>Rs. 3,500 or more</strong> qualify for <strong>100% FREE nationwide delivery</strong>.</p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#4A3B32] mb-1.5">3. Estimated Timelines</h3>
              <p>• Major Metropolitan Areas (Karachi, Lahore, Islamabad, Rawalpindi): 2 to 3 business days.</p>
              <p>• Other Regional Cities & Towns: 3 to 5 business days.</p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#4A3B32] mb-1.5">4. Live Tracking</h3>
              <p>As soon as your parcel is dispatched, a tracking number and courier confirmation are logged to your order. You can track your parcel anytime at our Track My Order page.</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. RETURNS POLICY */}
      {pageType === 'returns-policy' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="border-b border-[#E8DCCB] pb-6">
            <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">Customer Guarantee</span>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-medium text-[#4A3B32] mt-1">14-Day Returns & Exchanges</h1>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DCCB] space-y-5 text-xs text-[#665449] leading-relaxed">
            <p>
              We want parents to have absolute peace of mind when ordering newborn clothes. We offer a 14-day hassle-free return and exchange policy from the date your package arrives.
            </p>
            <div>
              <h3 className="text-base font-semibold text-[#4A3B32] mb-1">Conditions for Return:</h3>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Items must remain unworn and unwashed to maintain newborn hygiene standards.</li>
                <li>Original brand tags and packaging must be intact.</li>
                <li>Gift sets and hampers must be returned with all included accessories (teethers, rattles, booties).</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#4A3B32] mb-1">Exchange Process:</h3>
              <p>Contact us via WhatsApp (+92 300 8765432) or email (care@littlenest.pk) with your order number. Our team will arrange a reverse pickup or guide you on the nearest courier drop point.</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. FAQ */}
      {pageType === 'faq' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="border-b border-[#E8DCCB] pb-6">
            <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">Help Center</span>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-medium text-[#4A3B32] mt-1">Frequently Asked Questions</h1>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What fabric do you use for newborn rompers and sleepsuits?",
                a: "We prioritize 100% GOTS certified organic combed cotton with gentle elastane stretch. Our fabrics are free from formaldehyde coatings, toxic phthalates, and synthetic chemical softeners."
              },
              {
                q: "Do you offer Cash on Delivery (COD) across Pakistan?",
                a: "Yes! Cash on Delivery is supported for orders across all major cities and towns in Pakistan. You only pay when the rider hands over your package."
              },
              {
                q: "How does payment verification work for Easypaisa and JazzCash?",
                a: "When you select Easypaisa or JazzCash at checkout, transfer the order total to our provided account and submit your transaction ID (TRX ID). Our accounts team verifies the transaction and immediately marks your order as payment verified."
              },
              {
                q: "What size should I order for a hospital homecoming outfit?",
                a: "For most full-term babies (up to 3.8 kg / 8.5 lbs), our Newborn (NB) or 0-3 Months size fits comfortably with gentle room for a diaper."
              },
              {
                q: "How do I wash organic baby clothes?",
                a: "We recommend gentle machine or hand washing with cold or lukewarm water (30°C) using mild, dye-free baby detergent. Air drying flat in the shade keeps organic fibers buttery soft."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-[#E8DCCB] space-y-2">
                <h4 className="text-sm font-semibold text-[#4A3B32] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#8A7569] shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-[#665449] pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. BLOG & BABY CARE GUIDES */}
      {pageType === 'blog' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="border-b border-[#E8DCCB] pb-6">
            <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">Parent Journal</span>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-medium text-[#4A3B32] mt-1">Baby Care Guides & Nursery Advice</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Newborn Hospital Bag Checklist: What Clothes Do You Actually Need?",
                read: "4 min read",
                date: "October 2026",
                desc: "A realistic packing guide for expecting parents: 3 sleepsuits, 2 swaddles, cotton booties, and gentle scratch mittens."
              },
              {
                title: "How to Wash & Care for Organic Baby Cotton Without Shrinking",
                read: "3 min read",
                date: "October 2026",
                desc: "Why low temperature water, gentle hypoallergenic detergents, and air drying preserve the buttery softness of organic ribbed knit."
              },
              {
                title: "The Art of Swaddling: Helping Your Newborn Settle for Deeper Sleep",
                read: "5 min read",
                date: "September 2026",
                desc: "Techniques for using breathable bamboo muslin swaddles to prevent the startle reflex while protecting hip development."
              },
              {
                title: "Choosing Between 0-3M and Newborn Sizes for Your Baby Shower Gift",
                read: "3 min read",
                date: "September 2026",
                desc: "Why veteran mothers recommend gifting 0-3M or 3-6M sets rather than NB sizes to ensure longer wear."
              }
            ].map((art, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E8DCCB] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#8A7569] mb-2">
                    <span>{art.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{art.read}</span>
                  </div>
                  <h3 className="font-serif-luxury text-xl font-medium text-[#4A3B32] hover:text-[#5A463C] transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[#735F53] mt-2 leading-relaxed">
                    {art.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E8DCCB]/50 flex items-center text-xs font-medium text-[#5A463C]">
                  <span>Read Article</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. PRIVACY POLICY */}
      {pageType === 'privacy-policy' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="border-b border-[#E8DCCB] pb-6">
            <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">Transparency</span>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-medium text-[#4A3B32] mt-1">Privacy Notice</h1>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DCCB] space-y-4 text-xs text-[#665449] leading-relaxed">
            <p>At Little Nest, your family's personal information is treated with highest security and confidentiality. We only collect details necessary to process delivery: customer name, delivery address, phone number for courier coordination, and email address for order notifications.</p>
            <p>We do not store credit card credentials. Payment verification for Easypaisa and JazzCash is processed using transaction reference numbers. Personal data is never sold or rented to third-party advertising brokers.</p>
          </div>
        </div>
      )}

      {/* 9. TERMS & CONDITIONS */}
      {pageType === 'terms' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="border-b border-[#E8DCCB] pb-6">
            <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">Legal Agreement</span>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-medium text-[#4A3B32] mt-1">Terms of Service</h1>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DCCB] space-y-4 text-xs text-[#665449] leading-relaxed">
            <p>All prices listed on Little Nest are quoted in Pakistani Rupees (PKR) and include applicable taxes. We reserve the right to verify customer phone numbers prior to dispatching Cash on Delivery (COD) orders to prevent failed logistics attempts.</p>
            <p>Orders placed using dropshipping supplier fulfillment are inspected and processed according to strict quality guidelines. In the rare event that a supplier item becomes unavailable, customers are promptly notified with choice of full refund or equivalent item exchange.</p>
          </div>
        </div>
      )}

    </div>
  );
};
