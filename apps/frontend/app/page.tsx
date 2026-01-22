"use client";

import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { ArrowRight, Zap, GitBranch, Shield, Globe, Cpu, Layers, PlayCircle, Command } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-[#08090A] text-white font-sans selection:bg-white/20">
            <Navbar />

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4">
                    <div className="container mx-auto max-w-6xl text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-8 hover:bg-white/10 transition-colors cursor-pointer">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            <span>n8n Gen 2.0 is live</span>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
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
                                    Read Documentation <Command className="ml-2 w-4 h-4 opacity-50" />
                                </Link>
                            </Button>
                        </div>

                        {/* Hero Visual - CSS Only Workflow Editor */}
                        <div className="mt-20 relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-[#0C0D0E] shadow-2xl overflow-hidden group">
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

                            {/* Canvas Area */}
                            <div className="h-[400px] md:h-[500px] relative w-full overflow-hidden bg-[#0A0A0A] p-8 flex items-center justify-center">
                                {/* Connection Lines (SVG) */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-50">
                                    <path d="M 300,250 C 400,250 400,150 500,150" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                                    <path d="M 300,250 C 400,250 400,350 500,350" fill="none" stroke="#333" strokeWidth="2" />
                                    <path d="M 680,150 C 750,150 750,250 820,250" fill="none" stroke="#333" strokeWidth="2" />
                                </svg>

                                {/* Node 1: Start */}
                                <div className="absolute left-[120px] top-1/2 -translate-y-1/2 transform transition-transform hover:scale-105 z-10">
                                    <div className="w-48 rounded-xl border border-white/10 bg-[#161719] p-4 shadow-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded bg-blue-500/10 text-blue-400">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-sm text-gray-200">Webhook</span>
                                        </div>
                                        <div className="h-6 w-full bg-white/5 rounded text-xs px-2 flex items-center text-gray-500 font-mono">
                                            POST /order/new
                                        </div>
                                    </div>
                                    {/* Output Dot */}
                                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-500 border-2 border-[#161719]"></div>
                                </div>

                                {/* Node 2a: Logic */}
                                <div className="absolute left-[500px] top-[150px] -translate-y-1/2 transform transition-transform hover:scale-105 z-10">
                                    <div className="w-48 rounded-xl border border-white/10 bg-[#161719] p-4 shadow-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded bg-yellow-500/10 text-yellow-400">
                                                <Cpu className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-sm text-gray-200">AI Analyze</span>
                                        </div>
                                        <div className="h-6 w-full bg-white/5 rounded text-xs px-2 flex items-center text-gray-500 font-mono">
                                            Model: GPT-4o
                                        </div>
                                    </div>
                                    {/* IO Dots */}
                                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-500 border-2 border-[#161719]"></div>
                                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-500 border-2 border-[#161719]"></div>
                                </div>

                                {/* Node 2b: Database */}
                                <div className="absolute left-[500px] top-[350px] -translate-y-1/2 transform transition-transform hover:scale-105 z-10">
                                    <div className="w-48 rounded-xl border border-white/10 bg-[#161719] p-4 shadow-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded bg-green-500/10 text-green-400">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-sm text-gray-200">Supabase</span>
                                        </div>
                                        <div className="h-6 w-full bg-white/5 rounded text-xs px-2 flex items-center text-gray-500 font-mono">
                                            Insert Row
                                        </div>
                                    </div>
                                    {/* Input Dot */}
                                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-500 border-2 border-[#161719]"></div>
                                </div>

                                {/* Node 3: Slack */}
                                <div className="absolute left-[820px] top-[250px] -translate-y-1/2 transform transition-transform hover:scale-105 z-10">
                                    <div className="w-48 rounded-xl border border-white/10 bg-[#161719] p-4 shadow-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded bg-purple-500/10 text-purple-400">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-sm text-gray-200">Slack</span>
                                        </div>
                                        <div className="h-6 w-full bg-white/5 rounded text-xs px-2 flex items-center text-gray-500 font-mono">
                                            Notify Channel
                                        </div>
                                    </div>
                                    {/* Input Dot */}
                                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-500 border-2 border-[#161719]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 border-t border-white/5">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Card 1 */}
                            <div className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                                    <GitBranch className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">Complex Routing</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Go beyond linear chains. Use switches, merge nodes, and advanced loops to handle any messy real-world process.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                    <Command className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">Developer Friendly</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Native support for JavaScript/TypeScript, Git source control, and a powerful CLI for your CI/CD pipelines.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">Enterprise Secure</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    SSO, Audit Logs, and granulated RBAC. Run it in your private VPC with no external data egress.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Highlight Section */}
                <section className="py-24 border-t border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none opacity-20"></div>

                    <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-semibold mb-6">Built for speed. <br /> Designed for scale.</h2>
                            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                Whether you're processing 10 events or 10 million, n8n scales with you. Our event-driven architecture ensures zero-latency handling for your most critical workflows.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-300">
                                    <PlayCircle className="w-5 h-5 text-green-400" />
                                    <span>Real-time execution logs</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Cpu className="w-5 h-5 text-blue-400" />
                                    <span>Dedicated worker nodes</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Layers className="w-5 h-5 text-purple-400" />
                                    <span>Horizontal scaling ready</span>
                                </li>
                            </ul>
                        </div>
                        {/* Abstract Visual */}
                        <div className="relative h-[400px] rounded-2xl border border-white/10 bg-white/5 p-1">
                            {/* Removed grid background here too */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center space-y-2">
                                    <div className="text-6xl font-bold font-mono text-white">2.5k+</div>
                                    <div className="text-sm text-gray-500 uppercase tracking-widest">Executions / Sec</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-white/5">
                    <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-blue-600"></div>
                            <span className="font-semibold text-lg">n8n</span>
                        </div>
                        <div className="flex gap-8 text-sm text-gray-400">
                            <Link href="#" className="hover:text-white transition-colors">Features</Link>
                            <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
                            <Link href="#" className="hover:text-white transition-colors">Blog</Link>
                            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                        </div>
                        <div className="text-sm text-gray-500">
                            © 2024 n8n Inc.
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
