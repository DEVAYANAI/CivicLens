import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Receive the form submitted by the website
    const formData = await request.formData();

    const image = formData.get("data");
    const citizenDescription = formData.get("citizen_description") || "";

    // Check image
    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          error: "Please upload a civic issue photo.",
        },
        {
          status: 400,
        },
      );
    }

    // Get Agent 1 production URL
    const agent1Url = process.env.N8N_AGENT1_URL;

    if (!agent1Url) {
      return NextResponse.json(
        {
          error: "N8N_AGENT1_URL is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    // Create the exact multipart form expected by n8n
    const n8nFormData = new FormData();

    n8nFormData.append("data", image);

    n8nFormData.append("citizen_description", String(citizenDescription));

    console.log("Sending complaint to Agent 1...");

    // Send to n8n Agent 1
    // Agent 1 → Agent 2 → Agent 3
    const response = await fetch(agent1Url, {
      method: "POST",
      body: n8nFormData,
    });

    const responseText = await response.text();

    console.log("n8n Agent 1-3 status:", response.status);

    console.log("n8n Agent 1-3 response:", responseText);

    // n8n returned an HTTP error
    if (!response.ok) {
      return NextResponse.json(
        {
          error: "n8n Agent 1-3 request failed.",
          status: response.status,
          details: responseText,
        },
        {
          status: response.status,
        },
      );
    }

    // n8n returned nothing
    if (!responseText.trim()) {
      return NextResponse.json(
        {
          error: "n8n returned an empty response.",
        },
        {
          status: 502,
        },
      );
    }

    // Convert n8n response into JSON
    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          error: "n8n returned an invalid JSON response.",
          raw: responseText,
        },
        {
          status: 502,
        },
      );
    }

    // Send Agent 1-3 result to website
    return NextResponse.json(result);
  } catch (error) {
    console.error("Report API error:", error);

    return NextResponse.json(
      {
        error: "Unable to connect to CivicLens Agent 1.",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
      },
    );
  }
}
