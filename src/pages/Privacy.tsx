const Privacy = () => {
    return (
        <div className="min-h-screen bg-background">

            <div className="container mx-auto px-4 lg:px-8 pt-44 pb-24">
                <div className="max-w-4xl mx-auto">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-muted-foreground mb-8 text-lg">
                        Last Updated: December 4, 2025
                    </p>

                    <div className="space-y-8 text-muted-foreground">
                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                            <p className="leading-relaxed">
                                Thrive Wellness ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information as part of our Virtual Enterprise educational project. This website is operated by students as part of the Virtual Enterprises International program for the 2025-2026 academic year.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">2. Educational Context</h2>
                            <p className="leading-relaxed">
                                This is an educational simulation. Any data collected is used solely for learning purposes within the Virtual Enterprises International ecosystem. We do not collect, store, or process real personal or financial information for commercial purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">3. Information We Collect</h2>
                            <p className="leading-relaxed mb-3">
                                As part of our educational simulation, we may collect the following types of information:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Cart Data:</strong> Items added to your shopping cart are stored locally in your browser using localStorage</li>
                                <li><strong>VEI Portal Data:</strong> When you complete a checkout, you are redirected to the official VEI portal which has its own privacy policies</li>
                                <li><strong>Website Analytics:</strong> General usage data to help us improve the educational experience (no personally identifiable information)</li>
                                <li><strong>Browser Information:</strong> Standard web browser information like device type and screen size for responsive design purposes</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">4. How We Use Information</h2>
                            <p className="leading-relaxed mb-3">
                                Information collected through this educational website is used to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Facilitate the simulated shopping and checkout experience</li>
                                <li>Improve website functionality and user experience</li>
                                <li>Demonstrate business operations as part of our curriculum</li>
                                <li>Fulfill educational requirements within the VEI program</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">5. Local Storage</h2>
                            <p className="leading-relaxed">
                                Your shopping cart data is stored locally in your browser using localStorage technology. This means your cart information stays on your device and is not transmitted to our servers. You can clear this data at any time by clearing your browser's localStorage or using the "Clear Cart" function.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">6. Third-Party Services</h2>
                            <p className="leading-relaxed">
                                When you proceed to checkout, you are redirected to the Virtual Enterprises International portal (portal.veinternational.org). VEI has its own privacy policy and data handling practices. We encourage you to review VEI's privacy policy when using their services.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">7. Cookies</h2>
                            <p className="leading-relaxed">
                                This website uses minimal cookies and browser storage primarily for:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li>Maintaining your shopping cart between sessions</li>
                                <li>Remembering your preferences</li>
                                <li>Improving website performance</li>
                            </ul>
                            <p className="leading-relaxed mt-3">
                                You can control cookie settings through your browser preferences.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">8. Data Security</h2>
                            <p className="leading-relaxed">
                                As an educational project, we implement reasonable security measures to protect information used in our simulation. However, since this is a learning environment, we do not collect sensitive personal or financial information that would require enterprise-level security protocols.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">9. Children's Privacy</h2>
                            <p className="leading-relaxed">
                                This website is an educational tool used in high school and college Virtual Enterprise programs. It is designed for use by students under teacher supervision and does not knowingly collect personal information from children under 13 without parental or educational consent.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">10. Your Rights</h2>
                            <p className="leading-relaxed">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li>Clear your cart data anytime through your browser</li>
                                <li>Opt out of using this educational website</li>
                                <li>Request information about data usage within the educational context</li>
                                <li>Contact the supervising educator with privacy concerns</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">11. Changes to This Policy</h2>
                            <p className="leading-relaxed">
                                We may update this Privacy Policy throughout the 2025-2026 academic year as our educational project evolves. Any changes will be posted on this page with an updated revision date.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-4">12. Contact Us</h2>
                            <p className="leading-relaxed">
                                If you have questions or concerns about this Privacy Policy or our educational project, please contact us through the information provided on our website or speak with your supervising educator.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 p-6 bg-card border border-border rounded-xl">
                        <p className="text-sm text-muted-foreground text-center">
                            This Privacy Policy is part of the Thrive Wellness Virtual Enterprise educational project (2025-2026).
                            This is a simulated business operation for learning purposes under Virtual Enterprises International.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
