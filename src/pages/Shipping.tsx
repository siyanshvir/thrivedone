import { Truck, Package, Clock, MapPin, Phone, Mail, Globe } from "lucide-react";

const shippingInfo = [
    {
        icon: Truck,
        title: "Standard Shipping",
        time: "5-7 Business Days",
        price: "$10.00 (Free on orders $150+)",
        description: "Our reliable standard shipping option from our Aurora, IL facility. Orders are processed within 1-2 business days."
    },
    {
        icon: Package,
        title: "Express Shipping",
        time: "2-3 Business Days",
        price: "$25.00",
        description: "Need it faster? Express shipping gets your order to you in no time from our Illinois warehouse."
    },
    {
        icon: Globe,
        title: "International Shipping",
        time: "10-14 Business Days",
        price: "Free on all orders",
        description: "We now ship globally from our Aurora headquarters! International rates apply based on destination."
    }
];

export default function Shipping() {
    return (
        <div className="min-h-screen flex flex-col bg-black">
            <main className="flex-1 pt-44 pb-20">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Hero Section */}
                        <div className="text-center mb-16 pt-10">
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                                Shipping <span className="text-glacier">Information</span>
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Fast, reliable shipping from our Aurora, IL headquarters to get your wellness products to your door.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 mb-16">
                            {/* Shipping Options */}
                            <div>
                                <h2 className="font-display text-2xl font-bold mb-8 text-center">Shipping Options</h2>
                                <div className="space-y-4">
                                    {shippingInfo.map((option) => (
                                        <div key={option.title} className="glass rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0">
                                                    <option.icon className="w-8 h-8 text-glacier" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-display text-xl font-bold mb-1">{option.title}</h3>
                                                    <p className="text-glacier font-semibold mb-1">{option.time}</p>
                                                    <p className="text-sm text-muted-foreground mb-2">{option.price}</p>
                                                    <p className="text-sm text-muted-foreground">{option.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Map Section */}
                            <div>
                                <h2 className="font-display text-2xl font-bold mb-8 text-center">Our Location</h2>
                                <div className="glass rounded-xl p-6 border border-border">
                                    <div className="aspect-square mb-6 rounded-lg overflow-hidden">
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2972.8674107397!2d-88.290443684665!3d41.760777979326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e4b5b5b5b5b5b%3A0x5b5b5b5b5b5b5b!2s2590+Ogden+Ave%2C+Aurora%2C+IL+60504!5e0!3m2!1sen!2sus!4v1234567890"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            className="rounded-lg"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-glacier flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold">Shipping Headquarters</p>
                                                <p className="text-sm text-muted-foreground">2590 Ogden Ave, Aurora, IL 60504</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-glacier flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold">Processing Hours</p>
                                                <p className="text-sm text-muted-foreground">Monday-Friday: 9AM-5PM CST</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="glass rounded-xl p-8 border border-border">
                            <h2 className="font-display text-2xl font-bold mb-8 text-center">Additional Information</h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-glacier" />
                                            Shipping Coverage
                                        </h3>
                                        <p className="text-muted-foreground">
                                            We ship to all 50 US states and internationally to select countries from our Aurora, IL facility.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Order Processing</h3>
                                        <p className="text-muted-foreground">
                                            All orders are processed at our Illinois headquarters within 1-2 business days before shipping.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Delivery Issues</h3>
                                        <p className="text-muted-foreground">
                                            If your package is lost, damaged, or hasn't arrived within the expected timeframe, please contact us at{" "}
                                            <a href="/contact" className="text-glacier hover:underline">our contact page</a>.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Holiday Shipping</h3>
                                        <p className="text-muted-foreground">
                                            During peak holiday seasons, shipping times may be slightly longer. We recommend ordering early to ensure timely delivery from our Aurora facility.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
