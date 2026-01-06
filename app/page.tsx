"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HeartPulse,
  Stethoscope,
  Microscope,
  Pill,
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
        case "ceo":
          router.push("/ceo/dashboard");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "laboratory":
          router.push("/laboratory/dashboard");
          break;
        case "pharmacy":
          router.push("/pharmacy/dashboard");
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
          const value = Math.floor(this.targets()[0].textContent);
          this.targets()[0].textContent = value.toLocaleString();
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
      icon: <Users className="h-8 w-8" />,
      title: "Multi-Role Management",
      description:
        "Seamless coordination between admin, CEO, laboratory, and pharmacy roles with tailored dashboards.",
      color: "text-blue-600",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Real-Time Analytics",
      description:
        "Comprehensive financial and operational insights with interactive charts and reports.",
      color: "text-green-600",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Compliant",
      description:
        "Enterprise-grade security with role-based access control and audit trails.",
      color: "text-purple-600",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "24/7 Availability",
      description:
        "Cloud-based system accessible from anywhere, anytime on any device.",
      color: "text-orange-600",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Responsive",
      description: "Perfect experience on desktop, tablet, and mobile devices.",
      color: "text-pink-600",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description:
        "Optimized performance with instant search and real-time updates.",
      color: "text-yellow-600",
    },
  ];

  const stats = [
    {
      number: 500,
      label: "Clinics Trust Us",
      icon: <HeartPulse className="h-6 w-6" />,
    },
    {
      number: 10000,
      label: "Patients Managed",
      icon: <Users className="h-6 w-6" />,
    },
    {
      number: 99.9,
      label: "Uptime Reliability",
      icon: <Shield className="h-6 w-6" />,
    },
    { number: 24, label: "Support Hours", icon: <Clock className="h-6 w-6" /> },
  ];

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>

        {/* Floating Icons */}
        <Stethoscope
          className="absolute top-20 left-20 text-blue-300 floating-icon"
          size={40}
        />
        <Microscope
          className="absolute top-32 right-32 text-green-300 floating-icon"
          size={35}
        />
        <Pill
          className="absolute bottom-40 left-32 text-purple-300 floating-icon"
          size={30}
        />
        <HeartPulse
          className="absolute bottom-20 right-20 text-pink-300 floating-icon"
          size={45}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Trusted by 500+ clinics worldwide
            </div>
          </div>

          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
          >
            Modern Clinic
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Management
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Streamline your healthcare operations with our all-in-one platform.
            Designed for efficiency, built for growth, trusted by medical
            professionals.
          </p>

          <div
            ref={buttonRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              size="lg"
              className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleGetStarted}
            >
              <Link href="/login">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm">Setup in 5 minutes</span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm">Rated 4.9/5 by users</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  <span className="stat-number" data-end={stat.number}>
                    0
                  </span>
                  {stat.number <= 100 && "%"}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From patient records to financial analytics, our comprehensive
              suite covers all aspects of modern clinic management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
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
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tailored for Every Role
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Customized dashboards and tools designed specifically for each
              team member's needs.
            </p>
          </div>

          <Tabs defaultValue="ceo" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ceo" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                CEO
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
              <TabsTrigger
                value="laboratory"
                className="flex items-center gap-2"
              >
                <Microscope className="h-4 w-4" />
                Laboratory
              </TabsTrigger>
              <TabsTrigger value="pharmacy" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Pharmacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ceo" className="p-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">
                    Executive Dashboard
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Financial Analytics
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Performance Metrics
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Revenue Reports
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Strategic Insights
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 text-white">
                  <BarChart3 className="h-16 w-16 mb-4" />
                  <h4 className="text-xl font-bold mb-2">
                    Real-time Business Intelligence
                  </h4>
                  <p>
                    Make data-driven decisions with comprehensive analytics and
                    forecasting tools.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Add similar content for other roles */}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Clinic?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of healthcare professionals who trust our platform to
            streamline their operations.
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
    </div>
  );
}
