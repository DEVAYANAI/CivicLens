"use client";

import {
  Activity,
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileImage,
  ShieldCheck,
  Sparkles,
  Upload,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";

type AgentStatus = "waiting" | "processing" | "success" | "error";

type Agent = {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  status: AgentStatus;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 1,
      name: "Photo Verification",
      subtitle: "AGENT 1",
      description:
        "Analyzes the uploaded image and identifies the civic issue.",
      status: "waiting",
    },
    {
      id: 2,
      name: "Priority Analysis",
      subtitle: "AGENT 2",
      description: "Calculates the urgency and priority of the complaint.",
      status: "waiting",
    },
    {
      id: 3,
      name: "Department Routing",
      subtitle: "AGENT 3",
      description: "Routes the complaint to the appropriate department.",
      status: "waiting",
    },
    {
      id: 4,
      name: "Resolution Verification",
      subtitle: "AGENT 4",
      description: "Compares before and after photos after the repair.",
      status: "waiting",
    },
  ]);

  function updateAgent(id: number, status: AgentStatus) {
    setAgents((current) =>
      current.map((agent) => (agent.id === id ? { ...agent, status } : agent)),
    );
  }

  function resetAgents() {
    setAgents((current) =>
      current.map((agent) => ({
        ...agent,
        status: "waiting",
      })),
    );
  }

  async function submitComplaint() {
    if (!file) {
      setErrorMessage("Please upload a civic issue photo.");
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMessage("");

    resetAgents();

    updateAgent(1, "processing");

    const formData = new FormData();

    formData.append("data", file);
    formData.append("citizen_description", description);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      console.log("Next.js API status:", response.status);

      console.log("Next.js API response:", responseText);

      let data: any;

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {
            error: "The server returned an invalid response.",
            raw: responseText,
          };
        }
      } else {
        data = {
          error: "The server returned an empty response.",
        };
      }

      if (!response.ok) {
        throw new Error(data?.error || "Complaint processing failed.");
      }

      updateAgent(1, "success");

      setTimeout(() => {
        updateAgent(2, "processing");
      }, 500);

      setTimeout(() => {
        updateAgent(2, "success");
      }, 1300);

      setTimeout(() => {
        updateAgent(3, "processing");
      }, 1500);

      setTimeout(() => {
        updateAgent(3, "success");
      }, 2300);

      setResult(data);
    } catch (error) {
      console.error("CivicLens frontend error:", error);

      updateAgent(1, "error");

      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  function getStatusText(status: AgentStatus) {
    if (status === "processing") {
      return "Processing";
    }

    if (status === "success") {
      return "Completed";
    }

    if (status === "error") {
      return "Failed";
    }

    return "Waiting";
  }

  function getStatusIcon(status: AgentStatus) {
    if (status === "processing") {
      return <Activity className="h-5 w-5 animate-pulse" />;
    }

    if (status === "success") {
      return <CheckCircle2 className="h-5 w-5" />;
    }

    if (status === "error") {
      return <XCircle className="h-5 w-5" />;
    }

    return <Clock3 className="h-5 w-5" />;
  }

  function getAgentIcon(id: number) {
    if (id === 1) {
      return <FileImage className="h-5 w-5 text-blue-400" />;
    }

    if (id === 2) {
      return <Activity className="h-5 w-5 text-purple-400" />;
    }

    if (id === 3) {
      return <Building2 className="h-5 w-5 text-orange-400" />;
    }

    return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
  }

  return (
    <main className="min-h-screen bg-[#060912] text-white">
      <header className="border-b border-white/10 bg-[#060912]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="font-bold tracking-tight">CivicLens</h1>

              <p className="text-xs text-slate-500">
                Civic Intelligence Platform
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <span>Report Issue</span>
            <span>Track Complaint</span>
            <span>Resolution</span>
          </nav>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            All Systems Operational
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-300">
            <Sparkles className="h-4 w-4" />
            Multi-Agent AI System
          </div>

          <h2 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Smarter cities
            <br />
            <span className="text-blue-500">start with one report.</span>
          </h2>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
            Report a civic issue with a photo. CivicLens uses specialized AI
            agents to verify, prioritize, route, and verify the resolution.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl">
            <div className="mb-7 flex items-center gap-4">
              <div className="rounded-xl bg-blue-500/10 p-3">
                <FileImage className="h-6 w-6 text-blue-400" />
              </div>

              <div>
                <h3 className="text-lg font-semibold">Report a Civic Issue</h3>

                <p className="text-sm text-slate-500">
                  Upload evidence and let AI handle the rest.
                </p>
              </div>
            </div>

            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 px-6 py-12 text-center transition hover:border-blue-500/60 hover:bg-blue-500/5">
              <div className="mb-4 rounded-2xl bg-blue-500/10 p-4">
                <Upload className="h-7 w-7 text-blue-400" />
              </div>

              <p className="font-medium">
                {file ? file.name : "Upload issue photo"}
              </p>

              <p className="mt-2 text-sm text-slate-500">PNG, JPG or WEBP</p>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0];

                  if (selectedFile) {
                    setFile(selectedFile);
                    setErrorMessage("");
                  }
                }}
              />
            </label>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                What happened?
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Example: Large pothole near the main road..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <button
              onClick={submitComplaint}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Activity className="h-5 w-5 animate-spin" />
                  Processing complaint...
                </>
              ) : (
                <>
                  Analyze Complaint
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            {errorMessage && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="font-semibold">Complaint processing failed</p>

                    <p className="mt-1 wrap-break-word text-red-300/80">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
            <div className="mb-7">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400" />

                <h3 className="text-lg font-semibold">AI Agent Pipeline</h3>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Four specialized agents, one civic workflow.
              </p>
            </div>

            <div className="space-y-3">
              {agents.map((agent, index) => (
                <div key={agent.id}>
                  <div
                    className={`rounded-2xl border p-5 transition-all duration-500 ${
                      agent.status === "processing"
                        ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/5"
                        : agent.status === "success"
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : agent.status === "error"
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-white/10 bg-black/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
                          {getAgentIcon(agent.id)}
                        </div>

                        <div>
                          <p className="text-xs font-semibold tracking-wider text-slate-500">
                            {agent.subtitle}
                          </p>

                          <h4 className="mt-1 font-semibold">{agent.name}</h4>

                          <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                            {agent.description}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex shrink-0 items-center gap-2 text-xs ${
                          agent.status === "processing"
                            ? "text-blue-400"
                            : agent.status === "success"
                              ? "text-emerald-400"
                              : agent.status === "error"
                                ? "text-red-400"
                                : "text-slate-500"
                        }`}
                      >
                        {getStatusIcon(agent.status)}

                        <span className="hidden sm:block">
                          {getStatusText(agent.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {index < agents.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowDown className="h-4 w-4 text-slate-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {result !== null && (
          <section className="mt-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-7">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />

              <div>
                <h3 className="font-semibold">Complaint received</h3>

                <p className="text-sm text-slate-500">
                  Your report has entered the CivicLens workflow.
                </p>
              </div>
            </div>

            <pre className="mt-6 overflow-x-auto rounded-2xl bg-black/30 p-5 text-xs leading-6 text-slate-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </section>
        )}

        <section className="mt-24">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              How it works
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              From report to resolution
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                number: "01",
                title: "Verify",
                text: "AI identifies the issue from the submitted photo.",
              },
              {
                number: "02",
                title: "Prioritize",
                text: "The complaint priority is determined from the issue.",
              },
              {
                number: "03",
                title: "Route",
                text: "The complaint is sent to the appropriate department.",
              },
              {
                number: "04",
                title: "Verify Fix",
                text: "AI compares before and after evidence.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-2xl border border-white/10 bg-white/2.5 p-6"
              >
                <span className="text-sm font-bold text-blue-500">
                  {item.number}
                </span>

                <h4 className="mt-4 font-semibold">{item.title}</h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-24 border-t border-white/10 py-8">
          <div className="flex flex-col justify-between gap-3 text-sm text-slate-600 md:flex-row">
            <span>© 2026 CivicLens</span>

            <span>AI-powered civic issue management</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
