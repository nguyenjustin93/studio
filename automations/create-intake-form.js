const fs = require("fs");
const path = require("path");
const http = require("http");
const { execSync } = require("child_process");

// Install dependencies if needed
function ensureDeps() {
  const deps = ["googleapis", "open"];
  const missing = deps.filter((d) => {
    try { require.resolve(d); return false; } catch { return true; }
  });
  if (missing.length) {
    console.log(`Installing: ${missing.join(", ")}...`);
    execSync(`npm install ${missing.join(" ")}`, { stdio: "inherit" });
  }
}
ensureDeps();

const { google } = require("googleapis");

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");
const SCOPES = [
  "https://www.googleapis.com/auth/forms.body",
  "https://www.googleapis.com/auth/drive.file",
];

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost:3000/oauth2callback"
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    console.log("\nOpening browser for Google auth...");
    console.log("If it doesn't open, paste this URL:\n", authUrl, "\n");

    try { require("open")(authUrl); } catch {}

    const server = http.createServer(async (req, res) => {
      if (!req.url.startsWith("/oauth2callback")) return;
      const code = new URL(req.url, "http://localhost:3000").searchParams.get("code");
      res.end("<h2>Auth complete. You can close this tab.</h2>");
      server.close();

      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      console.log("Token saved.\n");
      resolve(oAuth2Client);
    });

    server.listen(3000, () => console.log("Waiting for auth on http://localhost:3000 ..."));
    server.on("error", reject);
  });
}

async function createIntakeForm(auth) {
  const forms = google.forms({ version: "v1", auth });

  // Step 1: Create the form
  const form = await forms.forms.create({
    requestBody: {
      info: {
        title: "Real Estate Workflow Intake",
        documentTitle: "Real Estate Workflow Intake",
      },
    },
  });

  const formId = form.data.formId;
  console.log("Form created. ID:", formId);

  // Step 2: Add all questions via batchUpdate
  await forms.forms.batchUpdate({
    formId,
    requestBody: {
      requests: [
        // Q1 — Lead sources (checkbox)
        {
          createItem: {
            item: {
              title: "Where do most of your leads come from?",
              questionItem: {
                question: {
                  required: false,
                  choiceQuestion: {
                    type: "CHECKBOX",
                    options: [
                      { value: "Zillow / Realtor.com" },
                      { value: "Referrals" },
                      { value: "Social media" },
                      { value: "Sign calls / open houses" },
                      { value: "Other" },
                    ],
                  },
                },
              },
            },
            location: { index: 0 },
          },
        },
        // Q2 — CRM tool (radio)
        {
          createItem: {
            item: {
              title: "How do you currently track and manage leads?",
              questionItem: {
                question: {
                  required: false,
                  choiceQuestion: {
                    type: "RADIO",
                    options: [
                      { value: "Spreadsheet" },
                      { value: "Follow Up Boss" },
                      { value: "kvCORE" },
                      { value: "HubSpot" },
                      { value: "Nothing formal" },
                      { value: "Other" },
                    ],
                  },
                },
              },
            },
            location: { index: 1 },
          },
        },
        // Q3 — Lead volume (radio)
        {
          createItem: {
            item: {
              title: "Roughly how many new leads are you working per week?",
              questionItem: {
                question: {
                  required: false,
                  choiceQuestion: {
                    type: "RADIO",
                    options: [
                      { value: "1–5" },
                      { value: "6–15" },
                      { value: "16–30" },
                      { value: "30+" },
                    ],
                  },
                },
              },
            },
            location: { index: 2 },
          },
        },
        // Q4 — Follow-up process (paragraph)
        {
          createItem: {
            item: {
              title: "What does your follow-up process look like after a new lead comes in?",
              description: "e.g. I text them within an hour, then call the next day, then email weekly...",
              questionItem: {
                question: {
                  required: false,
                  textQuestion: { paragraph: true },
                },
              },
            },
            location: { index: 3 },
          },
        },
        // Q5 — Biggest pain points (checkbox)
        {
          createItem: {
            item: {
              title: "Which part of your day feels most manual or repetitive?",
              questionItem: {
                question: {
                  required: false,
                  choiceQuestion: {
                    type: "CHECKBOX",
                    options: [
                      { value: "Writing follow-up messages" },
                      { value: "Remembering to follow up at all" },
                      { value: "Updating lead status / notes" },
                      { value: "Scheduling calls or showings" },
                      { value: "Other" },
                    ],
                  },
                },
              },
            },
            location: { index: 4 },
          },
        },
        // Q6 — Lost deals (radio)
        {
          createItem: {
            item: {
              title: "Have you ever lost a deal you think came down to slow or inconsistent follow-up?",
              questionItem: {
                question: {
                  required: false,
                  choiceQuestion: {
                    type: "RADIO",
                    options: [
                      { value: "Yes, definitely" },
                      { value: "Probably, hard to say" },
                      { value: "Not that I know of" },
                    ],
                  },
                },
              },
            },
            location: { index: 5 },
          },
        },
        // Q7 — Tools tried (paragraph)
        {
          createItem: {
            item: {
              title: "Have you tried any automation or AI tools before?",
              description: "What did you try? Did it work? What went wrong?",
              questionItem: {
                question: {
                  required: false,
                  textQuestion: { paragraph: true },
                },
              },
            },
            location: { index: 6 },
          },
        },
        // Q8 — Success vision (paragraph)
        {
          createItem: {
            item: {
              title: "What would a win look like for you 90 days from now?",
              description: "e.g. Never missing a follow-up, closing 2 more deals per month, spending less time on admin...",
              questionItem: {
                question: {
                  required: false,
                  textQuestion: { paragraph: true },
                },
              },
            },
            location: { index: 7 },
          },
        },
      ],
    },
  });

  const formUrl = `https://docs.google.com/forms/d/${formId}/viewform`;
  const editUrl = `https://docs.google.com/forms/d/${formId}/edit`;

  console.log("\n✅ Intake form created successfully!");
  console.log("─────────────────────────────────────");
  console.log("Share link:", formUrl);
  console.log("Edit link: ", editUrl);
  console.log("─────────────────────────────────────\n");

  return formUrl;
}

(async () => {
  try {
    const auth = await authorize();
    await createIntakeForm(auth);
  } catch (err) {
    console.error("Error:", err.message || err);
    process.exit(1);
  }
})();
