import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Receive data from the website
    const formData = await request.formData();

    const complaintId = formData.get("complaint_id");

    const issueType = formData.get("issue_type");

    const description = formData.get("description");

    const before = formData.get("before");

    const after = formData.get("after");

    // -------------------------------
    // CHECK BEFORE IMAGE
    // -------------------------------

    if (!(before instanceof File)) {
      return NextResponse.json(
        {
          error: "Before photo is required.",
        },
        {
          status: 400,
        },
      );
    }

    // -------------------------------
    // CHECK AFTER IMAGE
    // -------------------------------

    if (!(after instanceof File)) {
      return NextResponse.json(
        {
          error: "After photo is required.",
        },
        {
          status: 400,
        },
      );
    }

    // -------------------------------
    // GET AGENT 4 URL
    // -------------------------------

    const agent4Url = process.env.N8N_AGENT4_URL;

    if (!agent4Url) {
      return NextResponse.json(
        {
          error: "N8N_AGENT4_URL is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    // -------------------------------
    // CREATE FORM FOR N8N
    // -------------------------------

    const n8nFormData = new FormData();

    n8nFormData.append("complaint_id", String(complaintId || ""));

    n8nFormData.append("issue_type", String(issueType || ""));

    n8nFormData.append("description", String(description || ""));

    n8nFormData.append("before", before);

    n8nFormData.append("after", after);

    console.log("Sending before/after photos to Agent 4...");

    // -------------------------------
    // CALL N8N AGENT 4
    // -------------------------------

    const response = await fetch(agent4Url, {
      method: "POST",
      body: n8nFormData,
    });

    const responseText = await response.text();

    console.log("Agent 4 status:", response.status);

    console.log("Agent 4 response:", responseText);

    // -------------------------------
    // HTTP ERROR
    // -------------------------------

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Agent 4 request failed.",
          status: response.status,
          details: responseText,
        },
        {
          status: response.status,
        },
      );
    }

    // -------------------------------
    // EMPTY RESPONSE
    // -------------------------------

    if (!responseText.trim()) {
      return NextResponse.json(
        {
          error: "Agent 4 returned an empty response.",
        },
        {
          status: 502,
        },
      );
    }

    // -------------------------------
    // PARSE JSON
    // -------------------------------

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          error: "Agent 4 returned an invalid JSON response.",
          raw: responseText,
        },
        {
          status: 502,
        },
      );
    }

    // -------------------------------
    // SEND RESULT TO WEBSITE
    // -------------------------------

    return NextResponse.json(result);
  } catch (error) {
    console.error("Agent 4 API error:", error);

    return NextResponse.json(
      {
        error: "Unable to connect to Agent 4.",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
      },
    );
  }
}
