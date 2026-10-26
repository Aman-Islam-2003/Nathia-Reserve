// /nathia/developer: text and structure as rendered on thenathiareserve.com/developer (owner-approved copy, CLAUDE.md §12).
// Generated from the live page's rendered DOM; edit by hand from here on. The closing CTA is shared (site.pageCta).
import { innerPageSchema, lazyParse } from "../schema";

export const getDeveloperPage = () => parse();

const parse = lazyParse(innerPageSchema, {
  slug: "/nathia/developer",
  meta: {
    title: "Elevate Holdings & Ahmed Khilji — The Developer | The Nathia Reserve",
    description: "A Pakistani luxury developer with one mandate: build the addresses Pakistan's mountains have never had. Only Northern Pakistan. Three reserves in five years, Nathia Gali first.",
    canonical: "https://thenathiareserve.com/developer",
    robots: "noindex, nofollow"
  },
  hero: {
    label: {
      no: "11",
      text: "Elevate Holdings"
    },
    title: [
      "Built by",
      [
        {
          em: "an operator."
        }
      ]
    ],
    lede: "A Pakistani luxury developer with one mandate: build the addresses Pakistan's mountains have never had. Only Northern Pakistan. Three reserves in five years, Nathia Gali first.",
    image: {
      img: "boardroom",
      alt: "Boardroom with a long walnut table facing the valley windows"
    }
  },
  sections: [
    {
      no: "01",
      title: [
        "The standard is the product"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "Every reserve is finished, furnished and then operated by Elevate itself. A developer who hands the building to a third party the day it is done has stopped standing behind it; Elevate stays."
        }
      ]
    },
    {
      no: "02",
      title: [
        "The vision"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "The Galyat drew over six million visitors in 2023, against roughly fifty registered hotels. Millions come for these mountains every year and find almost nothing built to receive them, so high end Pakistani tourism spends abroad what it cannot spend at home."
        },
        {
          type: "paragraph",
          text: "Elevate exists to close that gap: internationally credible mountain residences, finished, furnished, hotel operated, open all four seasons, in the places Pakistanis already love."
        }
      ]
    },
    {
      no: "03",
      title: [
        "Ahmed Khilji"
      ],
      blocks: [
        {
          type: "image",
          img: "founder",
          alt: "Ahmed Khilji, Founder of Elevate Holdings"
        },
        {
          type: "paragraph",
          text: "Before Elevate, Ahmed Khilji built VirtuPro, a 24/7 hospitality operations company that has handled guest operations across 4,000+ properties internationally: every guest message, check in, housekeeping dispatch and maintenance call that keeps a serviced building earning, around the clock."
        },
        {
          type: "paragraph",
          text: "The Reserve was designed backwards from how a building runs: guest flow, housekeeping routes, winter operations, owner income. Not just how it photographs."
        },
        {
          type: "quote",
          text: "We are building the addresses Pakistan deserves, to a standard this market has never seen. It begins on the Nathia road."
        }
      ]
    },
    {
      no: "04",
      title: [
        "Built in the open"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "The Nathia Reserve is being documented daily, in public: design decisions, site progress and the commercial reality included. A first project earns trust by being visible, not by being polished."
        },
        {
          type: "list",
          items: [
            "Architecture & design: Noor Khan Design Studio",
            "Principal contractor: ZKB",
            "Approvals: Galiyat Development Authority (GDA) approval; EPA Khyber Pakhtunkhwa environmental approval; Forest Department clearance",
            "Site works are underway. Handover in 2030.",
            "Follow the build: @thenathiareserve, @khilji.11, @ahmed.khiljii"
          ]
        }
      ]
    },
    {
      no: "05",
      title: [
        "Contact"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "Elevate Holdings: elevateholdings11@gmail.com. For allocation and release enquiries, register on the founders’ list."
        }
      ]
    }
  ],
  address: false
});
