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
  // --------------------------------------------------
  // AGENT 1-3 STATES
  // --------------------------------------------------

  const [file, setFile] = useState<File | null>(null);

  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<any>(null);

  const [errorMessage, setErrorMessage] = useState("");

  // --------------------------------------------------
  // AGENT 4 STATES
  // --------------------------------------------------

  const [afterFile, setAfterFile] = useState<File | null>(null);

  const [complaintId, setComplaintId] = useState("CMP-10234");

  const [agent4Loading, setAgent4Loading] = useState(false);

  const [agent4Result, setAgent4Result] = useState<any>(null);

  const [agent4Error, setAgent4Error] = useState("");

  // --------------------------------------------------
  // AGENT PIPELINE
  // --------------------------------------------------

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
      description: "Compares before and after photos to verify the repair.",
      status: "waiting",
    },
  ]);

  // --------------------------------------------------
  // UPDATE AGENT STATUS
  // --------------------------------------------------

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

  // --------------------------------------------------
  // AGENT 1 → 2 → 3
  // --------------------------------------------------

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
      // IMPORTANT:
      // This remains /api/report for Agent 1 → 2 → 3

      const response = await fetch("/api/report", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      console.log("Agent 1-3 API status:", response.status);

      console.log("Agent 1-3 API response:", responseText);

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

      // Agent 1 complete
      updateAgent(1, "success");

      // Agent 2
      setTimeout(() => {
        updateAgent(2, "processing");
      }, 400);

      setTimeout(() => {
        updateAgent(2, "success");
      }, 1200);

      // Agent 3
      setTimeout(() => {
        updateAgent(3, "processing");
      }, 1400);

      setTimeout(() => {
        updateAgent(3, "success");
      }, 2200);

      // Save result
      setResult(data);

      // If backend returns a complaint ID,
      // automatically use it for Agent 4.
      if (data?.complaint_id) {
        setComplaintId(data.complaint_id);
      }

      // If Agent 3 returned nested data,
      // try that too.
      if (data?.data?.complaint_id) {
        setComplaintId(data.data.complaint_id);
      }
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

  // --------------------------------------------------
  // AGENT 4
  // --------------------------------------------------

  async function verifyResolution() {
    if (!file) {
      setAgent4Error("The original before photo is missing.");
      return;
    }

    if (!afterFile) {
      setAgent4Error("Please upload the after/repaired photo.");
      return;
    }

    setAgent4Loading(true);
    setAgent4Error("");
    setAgent4Result(null);

    updateAgent(4, "processing");

    const formData = new FormData();

    formData.append("complaint_id", complaintId);

    // Use the issue type from Agent 1-3
    // if available. Otherwise use general.
    const issueType =
      result?.issue_type || result?.data?.issue_type || "general";

    formData.append("issue_type", issueType);

    formData.append("description", description);

    // IMPORTANT:
    // before = original uploaded image
    // after = repaired image

    formData.append("before", file);

    formData.append("after", afterFile);

    try {
      const response = await fetch("/api/verify-resolution", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      console.log("Agent 4 API status:", response.status);

      console.log("Agent 4 API response:", responseText);

      let data: any;

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {
            error: "Agent 4 returned an invalid response.",
            raw: responseText,
          };
        }
      } else {
        data = {
          error: "Agent 4 returned an empty response.",
        };
      }

      if (!response.ok) {
        throw new Error(data?.error || "Agent 4 verification failed.");
      }

      setAgent4Result(data);

      updateAgent(4, "success");
    } catch (error) {
      console.error("Agent 4 frontend error:", error);

      updateAgent(4, "error");

      setAgent4Error(
        error instanceof Error ? error.message : "Agent 4 verification failed.",
      );
    } finally {
      setAgent4Loading(false);
    }
  }

  // --------------------------------------------------
  // STATUS TEXT
  // --------------------------------------------------

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

  // --------------------------------------------------
  // STATUS ICON
  // --------------------------------------------------

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

  // --------------------------------------------------
  // AGENT ICON
  // --------------------------------------------------

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

  // --------------------------------------------------
  // FRONTEND
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#060912] text-white">
      {/* HEADER */}

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

      {/* HERO */}

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

        {/* MAIN GRID */}

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* REPORT CARD */}

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

            {/* BEFORE IMAGE */}

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

                    setAgent4Error("");
                  }
                }}
              />
            </label>

            {/* DESCRIPTION */}

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

            {/* ANALYZE BUTTON */}

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

            {/* AGENT 1-3 ERROR */}

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

          {/* AGENT PIPELINE */}

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

        {/* AGENT 1-3 RESULT */}

        {result !== null && (
          <section className="mt-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-7">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-blue-400" />

              <div>
                <h3 className="font-semibold">Complaint received</h3>

                <p className="text-sm text-slate-500">
                  Agents 1, 2 and 3 completed the complaint analysis.
                </p>
              </div>
            </div>

            <pre className="mt-6 overflow-x-auto rounded-2xl bg-black/30 p-5 text-xs leading-6 text-slate-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </section>
        )}

        {/* ================================================= */}
        {/* AGENT 4 - RESOLUTION VERIFICATION */}
        {/* ================================================= */}

        <section className="mt-10 rounded-3xl border border-emerald-500/20 bg-white/[0.035] p-7">
          {/* HEADER */}

          <div className="mb-7">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  Resolution Verification
                </h3>

                <p className="text-sm text-slate-500">
                  Upload the repaired photo to let Agent 4 verify the
                  resolution.
                </p>
              </div>
            </div>
          </div>

          {/* COMPLAINT INFORMATION */}

          <div className="grid gap-5 md:grid-cols-2">
            {/* COMPLAINT ID */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Complaint ID
              </label>

              <input
                value={complaintId}
                onChange={(event) => setComplaintId(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
                placeholder="CMP-10234"
              />
            </div>

            {/* BEFORE PHOTO */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Original Before Photo
              </label>

              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-400">
                {file ? (
                  <span className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />

                    {file.name}
                  </span>
                ) : (
                  "Upload a before photo above"
                )}
              </div>
            </div>
          </div>

          {/* AFTER PHOTO */}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              After / Repaired Photo
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 px-6 py-10 text-center transition hover:border-emerald-500/50 hover:bg-emerald-500/5">
              <div className="mb-3 rounded-xl bg-emerald-500/10 p-3">
                <Upload className="h-7 w-7 text-emerald-400" />
              </div>

              <p className="font-medium">
                {afterFile ? afterFile.name : "Upload after photo"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Upload the photo after the repair
              </p>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0];

                  if (selected) {
                    setAfterFile(selected);

                    setAgent4Error("");

                    setAgent4Result(null);
                  }
                }}
              />
            </label>
          </div>

          {/* VERIFY BUTTON */}

          <button
            onClick={verifyResolution}
            disabled={agent4Loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 font-semibold shadow-lg shadow-emerald-600/10 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {agent4Loading ? (
              <>
                <Activity className="h-5 w-5 animate-spin" />
                Verifying Resolution...
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                Verify Resolution
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          {/* AGENT 4 ERROR */}

          {agent4Error && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="font-semibold">
                    Resolution verification failed
                  </p>

                  <p className="mt-1 wrap-break-word text-red-300/80">
                    {agent4Error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AGENT 4 RESULT */}

          {agent4Result && (
            <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {agent4Result.resolved ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-400" />
                  )}

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Agent 4 Result
                    </p>

                    <h4 className="mt-1 text-2xl font-bold">
                      {agent4Result.resolved ? "Resolved" : "Unresolved"}
                    </h4>
                  </div>
                </div>

                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    agent4Result.resolved
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {agent4Result.status ||
                    (agent4Result.resolved ? "resolved" : "unresolved")}
                </div>
              </div>

              {/* RESULT STATS */}

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/5 bg-white/2.5 p-4">
                  <p className="text-xs text-slate-500">Complaint ID</p>

                  <p className="mt-1 font-semibold">
                    {agent4Result.complaint_id || complaintId}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/2.5 p-4">
                  <p className="text-xs text-slate-500">Confidence</p>

                  <p className="mt-1 text-xl font-bold">
                    {Math.round((Number(agent4Result.confidence) || 0) * 100)}%
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/2.5 p-4">
                  <p className="text-xs text-slate-500">Status</p>

                  <p className="mt-1 font-semibold capitalize">
                    {agent4Result.status || "Unknown"}
                  </p>
                </div>
              </div>

              {/* NOTES */}

              <div className="mt-4 rounded-xl border border-white/5 bg-white/2.5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  AI Verification Notes
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {agent4Result.notes || "No additional notes provided."}
                </p>
              </div>

              {/* FILE NAMES */}

              {(agent4Result.before_file_name ||
                agent4Result.after_file_name) && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-black/20 p-4">
                    <p className="text-xs text-slate-500">Before Evidence</p>

                    <p className="mt-1 text-sm text-slate-300">
                      {agent4Result.before_file_name ||
                        file?.name ||
                        "before image"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-black/20 p-4">
                    <p className="text-xs text-slate-500">After Evidence</p>

                    <p className="mt-1 text-sm text-slate-300">
                      {agent4Result.after_file_name ||
                        afterFile?.name ||
                        "after image"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}

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
                text: "AI identifies the civic issue from the submitted photo.",
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

        {/* FOOTER */}

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
