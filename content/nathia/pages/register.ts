// /nathia/register: the hero and the registration form, as rendered on thenathiareserve.com/register
// (owner-approved copy, CLAUDE.md §12). The form never submits anywhere real: it saves locally and shows the
// success state (CLAUDE.md §12).
import { lazyParse, registerSchema } from "../schema";

export const getRegisterPage = () => parse();

const parse = lazyParse(registerSchema, {
  slug: "/nathia/register",
  meta: {
    title: "Register Interest | The Nathia Reserve, Nathia Gali",
    description:
      "Register priority interest in The Nathia Reserve: 133 hotel operated residences on the main Nathia Gali road at 7,900 ft, by Elevate Holdings. From PKR 3.9 crore. 10% to book, 1% monthly.",
    canonical: "https://thenathiareserve.com/register",
    robots: "noindex, nofollow",
  },
  hero: {
    label: { no: "01", text: "Nathia Gali · The Galiyat · 7,900 ft" },
    title: ["Own a residence at", "Pakistan’s most premium", [{ em: "apartment hotel." }]],
    proofs: [
      "133 residences on the main Nathia Gali road, open and staffed all four seasons",
      "Every residence earns inside the Reserve’s own hotel operation, with no caretaker to manage",
      "From PKR 3.9 crore · 10% to book · 1% a month · handover 2030",
    ],
    cta: "Register priority interest",
    ctaNote: "Twenty seconds. Our team replies on WhatsApp.",
  },
  form: {
    label: "Join the founders’ list",
    steps: ["I’m interested in", "And you are", "Where we reach you"],
    interests: ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "Penthouse", "Advise me"],
    soldOut: "Sold out",
    fields: {
      name: "Full name *",
      city: "City *",
      whatsapp: "WhatsApp number *",
      whatsappPlaceholder: "3XX XXXXXXX",
      dialLabel: "Country dialling code",
      email: "Email *",
      emailPlaceholder: "you@email.com",
    },
    heard: {
      question: "How did you hear about The Nathia Reserve?",
      optional: "Optional",
      options: [
        "An Instagram or Facebook ad",
        "Instagram, not an ad",
        "A friend or family member",
        "A property dealer or agent",
        "Someone from the Reserve team",
        "Google or ChatGPT",
        "A billboard or print",
        "An event",
        "Somewhere else",
      ],
    },
    actions: { back: "Back", next: "Continue", submit: "Register interest" },
    // From live's bundle strings (shown only after input or submission; the live form is never submitted).
    errors: {
      interest: "Choose one to continue.",
      details: "Your name and city, please.",
      whatsapp: "A WhatsApp number we can reach you on.",
      email: "A valid email address.",
    },
    done: {
      label: "Received",
      title: "You’re on the founders’ list",
      body: "Our team will reach you personally on WhatsApp. Plans and founders’ pricing are released to the priority list first.",
      explore: "Explore the full experience",
      tour: "Tour the towers in 3D",
    },
    privacy:
      "Twenty seconds, and your progress saves as you go. Your details remain private to The Nathia Reserve and Elevate Holdings, and are used only to contact you about this project.",
    dialCodes: [
      { code: "92", label: "🇵🇰 +92" },
      { code: "44", label: "🇬🇧 +44" },
      { code: "971", label: "🇦🇪 +971" },
      { code: "966", label: "🇸🇦 +966" },
      { code: "1", label: "🇺🇸 +1" },
      { code: "974", label: "🇶🇦 +974" },
      { code: "968", label: "🇴🇲 +968" },
      { code: "965", label: "🇰🇼 +965" },
      { code: "973", label: "🇧🇭 +973" },
      { code: "61", label: "🇦🇺 +61" },
      { code: "49", label: "🇩🇪 +49" },
      { code: "47", label: "🇳🇴 +47" },
      { code: "65", label: "🇸🇬 +65" },
      { code: "60", label: "🇲🇾 +60" },
    ],
  },
});
