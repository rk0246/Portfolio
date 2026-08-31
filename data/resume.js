/**
 * Résumé content, transcribed from the PDF in /public/resume.pdf.
 *
 * The page renders these four exports in the same order the PDF does —
 * education first, because that's the lead for a student résumé.
 *
 * Wording stays close to the PDF's own phrasing on purpose. `tags` are the one
 * addition — they're pulled from terms already stated in the bullets, so
 * scanning the page doesn't require reading every line.
 *
 * The PDF is the source for wording, but not a strict subset check: a one-page
 * résumé has to cut things a page with no page count does not. Kaiba Dining
 * Group is here and not in the current PDF for exactly that reason — it is a
 * deliberate difference, not drift, so don't "fix" it by deleting the entry.
 */

export const education = [
  {
    school: "Carnegie Mellon University",
    location: "Pittsburgh, PA",
    degree:
      "B.S. Business Administration — Concentration in AI, Minor in Information Systems",
    dates: "August 2024 — December 2027",
    honors: ["GPA 4.0", "Dean's List 2024, 2025"],
    coursework: [
      "Machine Learning for Business Analytics",
      "Database Design & Development",
      "Finance",
      "Business Computing (Excel + MIS)",
    ],
  },
  {
    school: "Los Osos High School",
    location: "Rancho Cucamonga, CA",
    dates: "August 2020 — May 2024",
    honors: [
      "GPA 4.0 (UW) / 4.75 (W)",
      "1550 SAT",
      "Superintendent's Honor Roll",
    ],
  },
];

export const experience = [
  {
    role: "Handshake AI Training",
    company: "Handshake AI",
    dates: "January 2026 — Present",
    impact: [
      "Evaluated and labeled hundreds of AI-generated images against quality and accuracy criteria to improve model training data for image generation systems.",
      "Provided structured feedback on prompt-to-image outputs, helping refine model performance across style, composition, and realism benchmarks.",
    ],
    tags: ["Data Labeling", "Model Evaluation", "Image Generation"],
  },
  {
    role: "Head of Tech X Product Committee",
    company: "ScottyLabs",
    dates: "June 2025 — Present",
    impact: [
      "Serving as Product Lead for a developer team building hackathon management software.",
      "Identifying and implementing key features through market research, user testing, and competitive analysis with PostHog.",
    ],
    tags: ["Product Lead", "Market Research", "User Testing", "PostHog"],
  },
  {
    role: "Marketing Intern",
    company: "Zeon Capital",
    dates: "April 2025 — June 2025",
    impact: [
      "Created and managed social media content for a quantitative copy trading platform.",
      "Developed campaigns that improved user engagement and brand visibility.",
    ],
    tags: ["Social Media", "Content", "Campaigns"],
  },
  {
    role: "VP of Marketing, Consultant",
    company: "Tartan Marketing Association",
    dates: "January 2025 — Present",
    impact: [
      "Leading a 3–6 person team to manage social media, merchandise, and video production.",
      "Partnered with a local stand-up comedy club to boost sign-ups for their annual show.",
      "Collaborated with a local conservatory to amplify awareness of their Climate Toolkit Initiative.",
    ],
    tags: ["Team Lead", "Social Media", "Video Production", "Consulting"],
  },
  {
    role: "Data Analysis and Accounting Intern",
    company: "Kaiba Dining Group",
    dates: "June 2023 — August 2023",
    impact: [
      "Assisted with accrual-basis accounting and maintained financial data using spreadsheets.",
      "Supported marketing and data-driven decision-making through basic analytics.",
    ],
    tags: ["Accounting", "Analytics", "Spreadsheets"],
  },
];

/** The PDF's "Projects & Awards" block. `note` is the honour, where there is
    one — it renders in the accent next to the title. */
export const projectsAndAwards = [
  {
    title: "Students Using Data for Social Good",
    role: "Consultant",
    dates: "May 2026",
    impact: [
      "Built a Power BI dashboard analyzing data from over 700 users to determine success rates for an online resume builder and job application tool.",
      "Delivered verifiable statistics to multiple nonprofit partners, supporting data-driven decisions and credibility claims.",
    ],
    tags: ["Power BI", "Dashboards", "Nonprofit"],
  },
  {
    title: "HyperX DesignX Hackathon",
    note: "2nd Place",
    dates: "October 2022",
    impact: [
      "Conceptualized an original headphone design for HyperX, a leading gaming peripheral company.",
      "Developed a functional website and 3D product model within a 24-hour timeframe.",
    ],
    tags: ["Hackathon", "Industrial Design", "3D Modeling"],
  },
  {
    title: "YouTube + Freelance Creator",
    dates: "2020 — Present",
    impact: [
      "Built and scaled a YouTube channel to 20K+ subscribers and 4M+ views through a data-driven content strategy.",
      "Delivered paid photography and videography projects for startups, organizations, and local businesses, including a Y Combinator startup.",
    ],
    tags: ["YouTube", "Photography", "Videography"],
  },
];

export const skills = [
  {
    group: "Software",
    items: [
      "VS Code",
      "Claude Code",
      "Excel",
      "PostHog",
      "Figma",
      "Photoshop",
      "Premiere Pro",
      "Unity",
    ],
  },
  {
    group: "Technical",
    items: [
      "Python",
      "SQL",
      "HTML",
      "CSS",
      "Photography",
      "Film Production",
      "Marketing",
    ],
  },
  { group: "Languages", items: ["English", "Korean", "Spanish"] },
];
