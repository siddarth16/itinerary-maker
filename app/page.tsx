"use client"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, MapPin, Calendar, Download, Star, Globe, Plane } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto max-w-screen-xl px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-heading font-black text-4xl md:text-6xl lg:text-7xl mb-6 animate-fade-in-up">
              Plan Your Perfect
              <span className="text-primary block">Adventure</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-powered trip planning that creates personalized itineraries with flights, stays, and daily budgets in
              minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 animate-pulse-glow">
                <Link href="/plan">
                  Plan a Trip <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                View Sample Trip
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-screen-xl px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Four simple steps to your perfect trip</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: MapPin,
                title: "Input Preferences",
                description: "Tell us your destinations, dates, budget, and travel style",
              },
              {
                icon: Globe,
                title: "AI Search",
                description: "Our AI finds the best flights, stays, and activities for your trip",
              },
              {
                icon: Calendar,
                title: "Preview Itinerary",
                description: "Review your personalized day-by-day itinerary and costs",
              },
              {
                icon: Download,
                title: "Unlock & Download",
                description: "One-time payment unlocks full details and downloadable formats",
              },
            ].map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Preview */}
      <section className="py-20">
        <div className="container mx-auto max-w-screen-xl px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Sample Itinerary Preview</h2>
            <p className="text-lg text-muted-foreground">See what a TravelCraft itinerary looks like</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">European Adventure</CardTitle>
                    <CardDescription className="text-base">Jun 15 - Jun 28, 2024 • 2 travelers</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    $4,130 total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { day: "Day 1", city: "Paris", activities: "Arrive, Seine walk", cost: "$107" },
                    { day: "Day 2", city: "Paris", activities: "Louvre, Eiffel Tower", cost: "$124", locked: true },
                    {
                      day: "Day 3",
                      city: "Amsterdam",
                      activities: "Canal cruise, Anne Frank",
                      cost: "$95",
                      locked: true,
                    },
                    { day: "Day 4", city: "Amsterdam", activities: "Museums, local food", cost: "$89", locked: true },
                  ].map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{day.city}</div>
                          <div className={`text-sm ${day.locked ? "blur-sm" : "text-muted-foreground"}`}>
                            {day.activities}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{day.cost}</div>
                        {day.locked && (
                          <Badge variant="outline" className="text-xs">
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Unlock full itinerary with booking links, detailed activities, and downloadable formats
                  </p>
                  <Button>Unlock Full Itinerary - $29</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-screen-xl px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Trusted by Travelers</h2>
            <div className="flex items-center justify-center space-x-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
              <span className="ml-2 text-lg font-semibold">4.9/5 from 2,847 travelers</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                location: "San Francisco, CA",
                text: "TravelCraft planned my entire 2-week Europe trip in 10 minutes. The itinerary was perfect and saved me hours of research!",
              },
              {
                name: "Marcus Johnson",
                location: "Austin, TX",
                text: "The budget breakdown was incredibly accurate. I spent exactly what the app predicted, down to the daily expenses.",
              },
              {
                name: "Elena Rodriguez",
                location: "Miami, FL",
                text: "As someone who travels frequently for work, this tool is a game-changer. Professional quality itineraries every time.",
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto max-w-screen-xl px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Simple, One-Time Pricing</h2>
            <p className="text-lg text-muted-foreground">No subscriptions. Pay once per trip.</p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card className="border-primary/50 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">$29</CardTitle>
                <CardDescription className="text-lg">per trip unlock</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    "Complete day-by-day itinerary",
                    "All booking links and contact info",
                    "Detailed budget breakdown",
                    "XLSX, PDF, and JSON downloads",
                    "Alternative options for each booking",
                    "24/7 customer support",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full" size="lg">
                  <Link href="/plan">Start Planning Your Trip</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-screen-xl px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "How accurate are the prices?",
                  answer:
                    "Our prices are updated in real-time from booking partners and are typically accurate within 5-10%. Final prices may vary based on availability and booking timing.",
                },
                {
                  question: "Can I modify the itinerary after purchase?",
                  answer:
                    "Yes! After unlocking, you can request modifications through our support team. Minor adjustments are free, major changes may require a small additional fee.",
                },
                {
                  question: "What if I'm not satisfied with my itinerary?",
                  answer:
                    "We offer a 100% money-back guarantee within 24 hours of purchase if you're not completely satisfied with your itinerary.",
                },
                {
                  question: "Do you handle the actual bookings?",
                  answer:
                    "No, we provide you with all the information and links to make your own bookings. This gives you full control and often better customer service from the providers.",
                },
                {
                  question: "How long does it take to generate an itinerary?",
                  answer:
                    "Most itineraries are generated within 2-5 minutes. Complex multi-destination trips may take up to 10 minutes.",
                },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto max-w-screen-xl px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Plane className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-heading font-bold text-xl">TravelCraft</span>
              </div>
              <p className="text-sm text-muted-foreground">AI-powered trip planning for the modern traveler.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-sm">
                <Link href="/plan" className="block text-muted-foreground hover:text-foreground">
                  Plan a Trip
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Sample Itineraries
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Help Center
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Refund Policy
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  About
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 TravelCraft. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
