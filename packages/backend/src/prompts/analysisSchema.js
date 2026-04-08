/**
 * JSON Schema for Gemini Structured Output.
 * Matches the shape expected by the frontend (App.jsx) and analysisService.js.
 * 
 * Docs: https://ai.google.dev/gemini-api/docs/structured-output
 */

export const medicalReportSchema = {
  type: "object",
  properties: {
    patient_summary: {
      type: "object",
      description: "High-level patient demographic and report metadata.",
      properties: {
        name: {
          type: ["string", "null"],
          description: "Patient's full name as stated in the report."
        },
        age: {
          type: ["integer", "null"],
          description: "Patient's age in years."
        },
        gender: {
          type: ["string", "null"],
          description: "Patient's gender (Male/Female/Other)."
        },
        report_type: {
          type: "string",
          description: "Type of medical report (e.g. 'Complete Health Check', 'Blood Panel')."
        },
        report_date: {
          type: ["string", "null"],
          description: "Date of the report in YYYY-MM-DD format if available."
        },
        overall_health_status: {
          type: "string",
          description: "A brief 1-2 sentence assessment of the patient's overall health."
        }
      },
      required: ["report_type", "overall_health_status"]
    },

    abnormal_findings: {
      type: "array",
      description: "List of test parameters that are outside the normal range. Focus on clinically significant results.",
      items: {
        type: "object",
        properties: {
          parameter: {
            type: "string",
            description: "Name of the test or measurement."
          },
          value: {
            type: "string",
            description: "The measured value as a string."
          },
          unit: {
            type: "string",
            description: "Unit of measurement (e.g. mg/dL, %, pg/mL)."
          },
          normal_range: {
            type: "string",
            description: "The reference/normal range (e.g. '36 - 46')."
          },
          status: {
            type: "string",
            enum: ["high", "low", "abnormal"],
            description: "Whether the value is high, low, or abnormal."
          },
          clinical_significance: {
            type: "string",
            description: "Brief clinical explanation of why this is significant."
          }
        },
        required: ["parameter", "value", "unit", "normal_range", "status", "clinical_significance"]
      }
    },

    normal_findings: {
      type: "array",
      description: "List of key normal test parameters. Include up to 10 of the most important normal results.",
      items: {
        type: "object",
        properties: {
          parameter: {
            type: "string",
            description: "Name of the test."
          },
          value: {
            type: "string",
            description: "The measured value."
          },
          unit: {
            type: "string",
            description: "Unit of measurement."
          }
        },
        required: ["parameter", "value", "unit"]
      }
    },

    health_concerns: {
      type: "array",
      description: "Identified health concerns based on the abnormal findings and clinical impressions.",
      items: {
        type: "object",
        properties: {
          concern: {
            type: "string",
            description: "The identified health issue."
          },
          severity: {
            type: "string",
            enum: ["low", "moderate", "high"],
            description: "Severity level of the concern."
          },
          related_findings: {
            type: "array",
            items: { type: "string" },
            description: "List of parameter names related to this concern."
          }
        },
        required: ["concern", "severity", "related_findings"]
      }
    },

    recommendations: {
      type: "array",
      description: "Actionable recommendations based on the findings.",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["diet", "exercise", "medication", "follow_up", "lifestyle"],
            description: "Category of the recommendation."
          },
          recommendation: {
            type: "string",
            description: "Specific actionable advice."
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Priority level."
          }
        },
        required: ["category", "recommendation", "priority"]
      }
    },

    follow_up_care: {
      type: "object",
      description: "Suggested follow-up actions.",
      properties: {
        suggested_tests: {
          type: "array",
          items: { type: "string" },
          description: "Follow-up tests that should be considered."
        },
        specialist_referrals: {
          type: "array",
          items: { type: "string" },
          description: "Specialists the patient should consult."
        },
        timeline: {
          type: ["string", "null"],
          description: "Suggested follow-up timeline (e.g. '3 months', '6 weeks')."
        }
      },
      required: ["suggested_tests", "specialist_referrals"]
    }
  },
  required: [
    "patient_summary",
    "abnormal_findings",
    "normal_findings",
    "health_concerns",
    "recommendations",
    "follow_up_care"
  ]
};
