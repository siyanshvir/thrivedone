import { Mail, MapPin, Clock, Phone } from "lucide-react";
import { useForm, ValidationError } from '@formspree/react';

import { Button } from "@/components/ui/button";

export default function Contact() {
    const [state, handleSubmit] = useForm("xdaaodjn");

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 pt-44 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto pt-10">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Get in <span className="text-glacier">Touch</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Have a question or feedback? We'd love to hear from you.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="glass rounded-xl p-6 border border-border">
                  <Phone className="w-8 h-8 text-glacier mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Call Us</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    For immediate assistance
                  </p>
                  <a href="tel:+16303753300" className="text-glacier hover:underline text-lg font-semibold">
                    +1 (630) 375-3300
                  </a>
                </div>

                <div className="glass rounded-xl p-6 border border-border">
                  <Mail className="w-8 h-8 text-glacier mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    For general inquiries and support
                  </p>
                  <a href="mailto:contact@thrivewellness.com" className="text-glacier hover:underline">
                    contact@thrivewellness.com
                  </a>
                </div>

                <div className="glass rounded-xl p-6 border border-border">
                  <Clock className="w-8 h-8 text-glacier mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Response Time</h3>
                  <p className="text-muted-foreground text-sm">
                    We typically respond within 24-48 business hours.
                  </p>
                </div>

       
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                {state.succeeded ? (
                  <div className="glass rounded-xl p-12 border border-border text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-4 text-emerald-500">
                      Message Sent!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Thanks for reaching out. We'll get back to you soon.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="rounded-full"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="glass rounded-xl p-8 border border-border space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-glacier focus:outline-none transition-colors"
                          required
                        />
                        <ValidationError
                          prefix="Name"
                          field="name"
                          errors={state.errors}
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-glacier focus:outline-none transition-colors"
                          required
                        />
                        <ValidationError
                          prefix="Email"
                          field="email"
                          errors={state.errors}
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                      <input
                        id="subject"
                        type="text"
                        name="subject"
                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-glacier focus:outline-none transition-colors"
                        required
                      />
                      <ValidationError
                        prefix="Subject"
                        field="subject"
                        errors={state.errors}
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-glacier focus:outline-none transition-colors resize-none"
                        required
                      />
                      <ValidationError
                        prefix="Message"
                        field="message"
                        errors={state.errors}
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      className="w-full rounded-full"
                      disabled={state.submitting}
                    >
                      {state.submitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
