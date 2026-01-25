"use client";

import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { FiArrowRight, FiCommand } from "react-icons/fi"; // Feather icons
import { FaBolt, FaGitAlt, FaShieldAlt } from "react-icons/fa"; // FontAwesome
import { MdEmail, MdMessage } from "react-icons/md"; // Material Design
import { SiOpenai } from "react-icons/si"; // Simple icons for brands
import { HiPlay } from "react-icons/hi"; // Heroicons
import { BsCpu } from "react-icons/bs"; // Bootstrap Icons
import { BiGitBranch, BiLayer } from "react-icons/bi"; // BoxIcons
import { motion } from "framer-motion";
import WorkflowCanvas from "@/app/components/WorkflowCanvas";
import { BackgroundRippleEffect } from "@/app/components/ui/background-ripple-effect";
import { FeaturesSection } from "@/app/components/FeaturesSection";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-black text-white font-sans selection:bg-white/20">
            <Navbar />

            <main className="relative z-10">
                {/* Hero Section */}

                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
                    <BackgroundRippleEffect />
                    <div className="container mx-auto max-w-6xl text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-8 hover:bg-white/10 transition-colors cursor-pointer">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            <span>n8n Gen 2.0 is live</span>
                            <FiArrowRight className="w-3 h-3 text-gray-500" />
                        </div>

                        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-8 leading-[1.1]">
                            The standard for <br />
                            <span className="text-gray-400">modern automation.</span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Build complex workflows, integrate AI agents, and deploy to your own infrastructure. The power of code, with the speed of low-code.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button asChild size="lg" className="h-12 px-8 text-base font-medium rounded-lg bg-white text-black hover:bg-gray-200 transition-all">
                                <Link href="/signup">
                                    Start Building
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-medium rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all">
                                <Link href="https://docs.n8n.io" target="_blank">
                                    Read Documentation <FiCommand className="ml-2 w-4 h-4 opacity-50" />
                                </Link>
                            </Button>
                        </div>

                        {/* Hero Visual - CSS Only Workflow Editor */}
                        <div className="mt-64 relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-[#0C0D0E] shadow-2xl overflow-hidden group">
                            {/* Window Actions */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                                </div>
                                <div className="text-xs text-gray-500 font-mono">workflow / production / main</div>
                                <div className="w-16"></div>
                            </div>

                            {/* Canvas Area with React Flow */}
                            <div className="h-[400px] md:h-[500px] relative w-full overflow-hidden bg-[#0A0A0A]">
                                <WorkflowCanvas />
                            </div>
                        </div>
                    </div >
                </section >

                {/* Features Section */}
                < section className="py-24 border-t border-white/5" >
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Card 1 */}
                            <div className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BiGitBranch className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">Complex Routing</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Go beyond linear chains. Use switches, merge nodes, and advanced loops to handle any messy real-world process.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiCommand className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">Developer Friendly</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Native support for JavaScript/TypeScript, Git source control, and a powerful CLI for your CI/CD pipelines.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FaShieldAlt className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">Enterprise Secure</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    SSO, Audit Logs, and granulated RBAC. Run it in your private VPC with no external data egress.
                                </p>
                            </div>
                        </div>
                    </div>
                </section >

                <FeaturesSection />

                {/* Footer */}
                < footer className="py-12 border-t border-white/5" >
                    <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <img src="/n8n-color.svg" alt="n8n logo" width={24} height={24} className="object-contain invert brightness-0" />

                        </div>

                        <div className="text-sm text-gray-500">
                            © 2026 n8n Inc.
                        </div>
                    </div>
                </footer >
            </main >
        </div >
    );
}