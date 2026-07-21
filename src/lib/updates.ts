export type ResearchUpdateCategory =
  | "Clinical trial"
  | "NIH update"
  | "Regulatory & safety"
  | "Research publication";

export type ResearchUpdate = {
  category: ResearchUpdateCategory;
  dateLabel: string;
  description: string;
  sourceOrganization: string;
  sourceUrl: string;
  title: string;
};

export const psoriasisResearchUpdates: ResearchUpdate[] = [
  {
    category: "Clinical trial",
    dateLabel: "Updated April 13, 2026",
    description: "This registry record describes ONWARD3, a long-term study of ESK-001 in moderate to severe plaque psoriasis. Registry records are not treatment guidance.",
    sourceOrganization: "ClinicalTrials.gov",
    sourceUrl: "https://clinicaltrials.gov/study/NCT06846541",
    title: "ONWARD3 study record for ESK-001",
  },
  {
    category: "Research publication",
    dateLabel: "Published online July 12, 2025",
    description: "This peer-reviewed clinical-trial report describes a 12-week phase 2, randomized, dose-ranging study of ESK-001 in people with moderate-to-severe plaque psoriasis.",
    sourceOrganization: "PubMed / Journal of the American Academy of Dermatology",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/40659116/",
    title: "ESK-001 phase 2 study report",
  },
  {
    category: "Research publication",
    dateLabel: "Published online September 25, 2024",
    description: "This JAMA Dermatology randomized clinical trial compared home- and office-based narrowband UV-B phototherapy in people with psoriasis.",
    sourceOrganization: "PubMed / JAMA Dermatology",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/39319513/",
    title: "LITE randomized clinical trial report",
  },
  {
    category: "Regulatory & safety",
    dateLabel: "October 31, 2023",
    description: "FDA announced approval of Wezlana, an interchangeable ustekinumab biosimilar, for multiple inflammatory-disease uses that include plaque psoriasis.",
    sourceOrganization: "U.S. Food and Drug Administration",
    sourceUrl: "https://www.fda.gov/news-events/press-announcements/fda-approves-interchangeable-biosimilar-multiple-inflammatory-diseases",
    title: "FDA interchangeable biosimilar announcement",
  },
  {
    category: "Regulatory & safety",
    dateLabel: "October 17, 2023",
    description: "FDA’s 2023 novel-drug page lists bimekizumab among that year’s approvals and provides its approval-date summary for plaque psoriasis.",
    sourceOrganization: "U.S. Food and Drug Administration",
    sourceUrl: "https://www.fda.gov/drugs/novel-drug-approvals-fda/novel-drug-approvals-2023",
    title: "FDA 2023 novel-drug approval listing",
  },
  {
    category: "NIH update",
    dateLabel: "Reviewed October 2023",
    description: "NIAMS maintains an overview of psoriasis symptoms, causes, and research resources. This pilot links to the agency’s reference page without interpreting it for an individual.",
    sourceOrganization: "NIH / National Institute of Arthritis and Musculoskeletal and Skin Diseases",
    sourceUrl: "https://www.niams.nih.gov/health-topics/psoriasis",
    title: "NIH psoriasis overview and research resources",
  },
];
