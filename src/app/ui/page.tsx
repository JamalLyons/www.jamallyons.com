"use client";

import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaHome,
  FaCode,
  FaFileAlt,
  FaInfoCircle,
  FaCheck,
  FaStar,
} from "react-icons/fa";

import Navbar from "@/components/ui/Navbar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Particles from "@/components/Particles";

export default function UIComponentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/", icon: <FaHome /> },
    { label: "Projects", href: "/projects", icon: <FaCode /> },
    { label: "Blog", href: "/blog", icon: <FaFileAlt /> },
    { label: "About", href: "/about", icon: <FaInfoCircle /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14] text-gray-200">
      {/* Grid background */}
      <div className="grid-background" />

      {/* Animated particles */}
      <Particles />

      {/* Glowing center effect */}
      <div className="hero-glow" />

      {/* Navbar */}
      <Navbar
        items={navItems}
        rightContent={
          <Button size="sm" variant="outline">
            Contact
          </Button>
        }
      />

      <div className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-300 mb-8">
          UI Components
        </h1>

        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-purple-300 mb-6 border-b border-purple-900/30 pb-2">
            Buttons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Button Variants">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" icon={<FaCheck />}>
                    With Icon
                  </Button>
                  <Button variant="secondary" icon={<FaStar />}>
                    With Icon
                  </Button>
                </div>
              </div>
            </Card>

            <Card title="Button Sizes">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>

                <div>
                  <Button fullWidth>Full Width Button</Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-purple-300 mb-6 border-b border-purple-900/30 pb-2">
            Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Basic Card">
              <p>
                This is a basic card with just a title and content. Hover over
                it to see the hover effect.
              </p>
            </Card>

            <Card
              title="Card with Footer"
              footer={
                <div className="flex justify-end">
                  <Button size="sm" variant="outline">
                    Action
                  </Button>
                </div>
              }
            >
              <p>This card has a footer with an action button.</p>
            </Card>

            <Card hover={false}>
              <p className="font-semibold text-purple-300 mb-2">
                No Title Card
              </p>
              <p>This card has no title and hover effect is disabled.</p>
            </Card>
          </div>
        </section>

        {/* Forms Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-purple-300 mb-6 border-b border-purple-900/30 pb-2">
            Form Inputs
          </h2>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Username"
                  placeholder="Enter your username"
                  icon={<FaUser />}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  icon={<FaEnvelope />}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  icon={<FaLock />}
                />
              </div>

              <div className="space-y-4">
                <Input label="Standard Input" placeholder="No icon" />

                <Input
                  label="Disabled Input"
                  disabled
                  value="This input is disabled"
                />

                <Input
                  label="Input with Error"
                  error="This field is required"
                  placeholder="Error state"
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Modal Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-purple-300 mb-6 border-b border-purple-900/30 pb-2">
            Modal
          </h2>
          <Card>
            <div className="text-center py-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsModalOpen(true)}
              >
                Open Modal
              </Button>
            </div>

            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Modal Title"
              footer={
                <div className="flex justify-end space-x-3">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
                </div>
              }
            >
              <div className="space-y-4">
                <p>
                  This is an example modal with a title, content area, and
                  footer with actions.
                </p>
                <p>
                  Notice the subtle animations and glowing effects that match
                  our sci-fi theme.
                </p>
                <Input
                  label="Sample Input"
                  placeholder="Try focusing this input"
                />
              </div>
            </Modal>
          </Card>
        </section>
      </div>
    </div>
  );
}
