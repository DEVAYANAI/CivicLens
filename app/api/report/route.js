import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const file = formData.get("data");
    const description = formData.get("citizen_description");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Photo is required.",
        },
        {
          status: 400,
        },
      );
    }

    const n8nUrl = process.env.N8N_AGENT1_URL;

    if (!n8nUrl) {
      return NextResponse.json(
        {
          error: "N8N_AGENT1_URL is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    const n8nFormData = new FormData();

    n8nFormData.append("data", file);
    n8nFormData.append("citizen_description", String(description || ""));

    const n8nResponse = await fetch(n8nUrl, {
      method: "POST",
      body: n8nFormData,
    });

    const responseText = await n8nResponse.text();

    console.log("n8n status:", n8nResponse.status);
    console.log("n8n response:", responseText);

    if (!n8nResponse.ok) {
      return NextResponse.json(
        {
          error: "n8n request failed.",
          status: n8nResponse.status,
          details: responseText,
        },
        {
          status: n8nResponse.status,
        },
      );
    }

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

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = {
        raw: responseText,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("CivicLens API error:", error);

    return NextResponse.json(
      {
        error: "Unable to connect to CivicLens backend.",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
      },
    );
  }
}
