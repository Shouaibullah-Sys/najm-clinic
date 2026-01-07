"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Warehouse,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Shield,
  BarChart3,
  Clock,
  Smartphone,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Play,
  Home,
  Building,
  Scissors,
  Calculator,
  Eye,
  DollarSign,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // Refs for GSAP animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "staff":
          router.push("/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    // Hero section animations
    const tl = gsap.timeline();

    tl.fromTo(
      titleRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    )
      .fromTo(
        subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      )
      .fromTo(
        buttonRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.3"
      );

    // Features section animations
    gsap.fromTo(
      ".feature-card",
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Stats counter animation
    gsap.fromTo(
      ".stat-number",
      { textContent: 0 },
      {
        textContent: (
          i: any,
          target: { getAttribute: (arg0: string) => any }
        ) => {
          const endValue = parseInt(target.getAttribute("data-end") || "0");
          return endValue;
        },
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
        onUpdate: function () {
          const targets = this.targets();
          if (targets.length === 0 || !targets[0]) return;
          const value = Math.floor(targets[0].textContent || 0);
          targets[0].textContent = value.toLocaleString();
        },
      }
    );

    // CTA section animation
    gsap.fromTo(
      ctaRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Floating animation for hero icons
    const floatingIcons = gsap.utils.toArray(".floating-icon");
    floatingIcons.forEach((icon: any) => {
      gsap.to(icon, {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const features = [
    {
      icon: <Warehouse className="h-8 w-8" />,
      title: "Glass Inventory Management",
      description:
        "Track glass stock, types, thickness, and dimensions with real-time inventory updates and alerts.",
      color: "text-blue-600",
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "Order Processing",
      description:
        "Streamline order management from quotation to delivery with custom cut-to-size options.",
      color: "text-green-600",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Sales Analytics",
      description:
        "Comprehensive sales reports, profit analysis, and performance metrics for informed decisions.",
      color: "text-purple-600",
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Daily Records & Expenses",
      description:
        "Track daily ophthalmologist consultations, operations, and business expenses in one place.",
      color: "text-orange-600",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Role-Based",
      description:
        "Enterprise-grade security with role-based access control for admin and staff members.",
      color: "text-pink-600",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Fast & Efficient",
      description:
        "Optimized performance with quick search, barcode scanning, and real-time data synchronization.",
      color: "text-yellow-600",
    },
  ];

  const stats = [
    {
      number: 250,
      label: "Glass Businesses Trust Us",
      icon: <Building className="h-6 w-6" />,
    },
    {
      number: 50000,
      label: "Square Meters Managed",
      icon: <Home className="h-6 w-6" />,
    },
    {
      number: 99.9,
      label: "System Uptime",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      number: 24,
      label: "Support Hours",
      icon: <Clock className="h-6 w-6" />,
    },
  ];

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 dark:bg-cyan-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-sky-200 dark:bg-sky-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>

        {/* Floating Glass Icons */}
        <Home
          className="absolute top-20 left-20 text-blue-300 dark:text-blue-700 floating-icon"
          size={40}
        />
        <Scissors
          className="absolute top-32 right-32 text-green-300 dark:text-green-700 floating-icon"
          size={35}
        />
        <Package
          className="absolute bottom-40 left-32 text-purple-300 dark:text-purple-700 floating-icon"
          size={30}
        />
        <Warehouse
          className="absolute bottom-20 right-20 text-cyan-300 dark:text-cyan-700 floating-icon"
          size={45}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Trusted by 250+ glass businesses
            </div>
          </div>

          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Glass Business
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              {" "}
              Management System
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Streamline your glass business operations with our all-in-one
            platform. Manage inventory, process orders, track sales, and handle
            ophthalmologist records efficiently.
          </p>

          <div
            ref={buttonRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              size="lg"
              className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              onClick={handleGetStarted}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 text-lg dark:border-gray-600 dark:text-gray-300"
              onClick={() => router.push("/login")}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 dark:opacity-70">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm dark:text-gray-300">
                No credit card required
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm dark:text-gray-300">
                Setup in 5 minutes
              </span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm dark:text-gray-300">
                Rated 4.8/5 by users
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  <span className="stat-number" data-end={stat.number}>
                    0
                  </span>
                  {stat.number <= 100 && "%"}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Glass Business Solution
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From inventory tracking to ophthalmologist record keeping, our
              platform covers all aspects of modern glass business management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 dark:bg-gray-800 dark:border-gray-700"
              >
                <CardHeader>
                  <div
                    className={`p-3 rounded-full w-fit ${feature.color.replace(
                      "text",
                      "bg"
                    )} bg-opacity-10`}
                  >
                    <div className={feature.color}>{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Features */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Designed for Your Business Needs
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Customized tools and dashboards for both glass business management
              and ophthalmologist practice.
            </p>
          </div>

          <Tabs defaultValue="glass" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="glass" className="flex items-center gap-2">
                <Warehouse className="h-4 w-4" />
                Glass Business
              </TabsTrigger>
              <TabsTrigger
                value="ophthalmologist"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Ophthalmologist
              </TabsTrigger>
            </TabsList>

            <TabsContent value="glass" className="p-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4 dark:text-white">
                    Glass Business Management
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Inventory Management
                    </li>
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Order Processing & Invoicing
                    </li>
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Customer Management
                    </li>
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Supplier & Purchase Orders
                    </li>
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Sales Analytics & Reports
                    </li>
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Glass Cut-to-Size Calculations
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-8 text-white">
                  <Warehouse className="h-16 w-16 mb-4" />
                  <h4 className="text-xl font-bold mb-2">
                    Complete Glass Business Solution
                  </h4>
                  <p>
                    Manage your entire glass business from inventory to sales
                    with our comprehensive platform.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ophthalmologist" className="p-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4 dark:text-white">
                    Ophthalmologist Practice
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Daily Consultation Records
                    </li>
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Operation & Procedure Tracking
                    </li>
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Expense Management
                    </li>
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Patient Billing & Payments
                    </li>
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Financial Reports
                    </li>
                    <li className="flex items-center dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Practice Analytics
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-8 text-white">
                  <Eye className="h-16 w-16 mb-4" />
                  <h4 className="text-xl font-bold mb-2">
                    Ophthalmologist Practice Management
                  </h4>
                  <p>
                    Streamline your ophthalmology practice with comprehensive
                    patient and financial management tools.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your business needs. No hidden fees, no
              surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <Card className="border-2 hover:border-blue-500 transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl dark:text-white">
                  Basic
                </CardTitle>
                <div className="text-4xl font-bold dark:text-white">
                  $49
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Basic Inventory Management
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Order Processing
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />1
                    User License
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Basic Support
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan (Recommended) */}
            <Card className="border-2 border-blue-500 shadow-xl scale-105 dark:bg-gray-800">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl dark:text-white">
                  Professional
                </CardTitle>
                <div className="text-4xl font-bold dark:text-white">
                  $99
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Advanced Inventory Management
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Full Order & CRM System
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Ophthalmologist Module
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Up to 5 Users
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Priority Support
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Advanced Analytics
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 hover:border-purple-500 transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl dark:text-white">
                  Enterprise
                </CardTitle>
                <div className="text-4xl font-bold dark:text-white">
                  $199
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Unlimited Everything
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Custom Development
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Unlimited Users
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    24/7 Premium Support
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    API Access
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Dedicated Account Manager
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="py-20 bg-gradient-to-r from-blue-600 to-cyan-700 text-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Glass Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of glass businesses and ophthalmologists who trust our
            platform to streamline their operations.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-100"
            onClick={handleGetStarted}
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm opacity-75">
            No credit card required • 30-day free trial • Setup in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                Glass Management System
              </h3>
              <p className="text-gray-400">
                Comprehensive solution for glass businesses and ophthalmologist
                practices.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Glass Inventory</li>
                <li>Order Management</li>
                <li>Daily Records</li>
                <li>Expense Tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@glassmanagement.com</li>
                <li>+1 (555) 123-4567</li>
                <li>24/7 Support Available</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} Glass Management System. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
