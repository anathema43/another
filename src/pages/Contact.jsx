import React from "react";
import { useForm } from "react-hook-form";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../store/authStore";
import ContentEditor from "../components/ContentEditor";
import { CONTACT_INFO, BUSINESS_HOURS } from "../utils/constants";
import { apiService } from "../services/apiService";

export default function Contact() {
  const { userProfile } = useAuthStore();
  const [showEditor, setShowEditor] = React.useState(false);
  const isAdmin = userProfile?.role === 'admin';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm();

  const [submitted, setSubmitted] = React.useState(false);

  const onSubmit = async (data) => {
    try {
      await apiService.submitContactForm(data);
      setSubmitted(true);
      reset();
    } catch (error) {
      setError("root", {
        type: "manual",
        message: error.message || "Failed to send message. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen bg-organic-background" data-cy="contact-page">
      {/* Admin Edit Button */}
      {isAdmin && (
        <div className="fixed top-20 right-4 z-40">
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="bg-organic-primary text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-all"
            title="Edit page content"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )}

      {/* Content Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <ContentEditor 
              pageId="contact" 
              title="Contact"
              onClose={() => setShowEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 bg-organic-text text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="font-display text-3xl font-bold text-organic-text mb-8">
                Contact Information
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <EnvelopeIcon className="w-6 h-6 text-organic-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-organic-text mb-1">Email</h3>
                    <p className="text-organic-text">{CONTACT_INFO.email.support}</p>
                    <p className="text-organic-text">{CONTACT_INFO.email.hello}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <PhoneIcon className="w-6 h-6 text-organic-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-organic-text mb-1">Phone</h3>
                    <p className="text-organic-text">{CONTACT_INFO.phone.nepal}</p>
                    <p className="text-organic-text">{CONTACT_INFO.phone.international}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <MapPinIcon className="w-6 h-6 text-organic-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-organic-text mb-1">Address</h3>
                    <address className="text-organic-text not-italic">
                      {CONTACT_INFO.address.street}<br />
                      {CONTACT_INFO.address.country} {CONTACT_INFO.address.postalCode}
                    </address>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="font-display text-2xl font-bold text-organic-text mb-4">
                  Business Hours
                </h3>
                <div className="space-y-2 text-organic-text">
                  <p>{BUSINESS_HOURS.weekdays}</p>
                  <p>{BUSINESS_HOURS.saturday}</p>
                  <p>{BUSINESS_HOURS.sunday}</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg" data-cy="contact-form">
              <h2 className="font-display text-3xl font-bold text-organic-text mb-6">
                Send us a Message
              </h2>
              
              {submitted ? (
                <div className="text-center py-8" role="alert" aria-live="polite">
                  <div className="w-16 h-16 bg-organic-highlight rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-organic-text mb-2" data-cy="success-message">Message Sent!</h3>
                  <p className="text-organic-text">Thank you for contacting us. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  <div>
                    <label htmlFor="name" className="block text-organic-text font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      data-cy="contact-name"
                      {...register("name", {
                        required: "Full name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters"
                        },
                        maxLength: {
                          value: 100,
                          message: "Name must be less than 100 characters"
                        }
                      })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-organic-text font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      data-cy="contact-email"
                      {...register("email", {
                        required: "Email address is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Please enter a valid email address"
                        }
                      })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-organic-text font-medium mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      data-cy="contact-subject"
                      {...register("subject", {
                        required: "Subject is required",
                        minLength: {
                          value: 5,
                          message: "Subject must be at least 5 characters"
                        },
                        maxLength: {
                          value: 200,
                          message: "Subject must be less than 200 characters"
                        }
                      })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-invalid={errors.subject ? 'true' : 'false'}
                      aria-describedby={errors.subject ? 'subject-error' : undefined}
                    />
                    {errors.subject && (
                      <p id="subject-error" className="mt-1 text-sm text-red-600" role="alert">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-organic-text font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      data-cy="contact-message"
                      rows={5}
                      {...register("message", {
                        required: "Message is required",
                        minLength: {
                          value: 10,
                          message: "Message must be at least 10 characters"
                        },
                        maxLength: {
                          value: 2000,
                          message: "Message must be less than 2000 characters"
                        }
                      })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent ${
                        errors.message ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-invalid={errors.message ? 'true' : 'false'}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                    />
                    {errors.message && (
                      <p id="message-error" className="mt-1 text-sm text-red-600" role="alert">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {errors.root && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
                      <p className="text-red-700">{errors.root.message}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    data-cy="contact-submit"
                    disabled={isSubmitting}
                    className="w-full bg-organic-primary text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-organic-primary focus:ring-offset-2"
                    aria-describedby={isSubmitting ? 'submit-status' : undefined}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                  {isSubmitting && (
                    <p id="submit-status" className="sr-only" aria-live="polite">
                      Sending your message, please wait...
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}