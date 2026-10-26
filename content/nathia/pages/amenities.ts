// /nathia/amenities: text and structure as rendered on thenathiareserve.com/amenities (owner-approved copy, CLAUDE.md §12).
// Generated from the live page's rendered DOM; edit by hand from here on. The closing CTA is shared (site.pageCta).
import { innerPageSchema, lazyParse } from "../schema";

export const getAmenitiesPage = () => parse();

const parse = lazyParse(innerPageSchema, {
  slug: "/nathia/amenities",
  meta: {
    title: "Amenities — Alpine Spa, Heated Pool, Forest Dining Pods | The Nathia Reserve",
    description: "More than 25,000 sq ft across four dedicated levels. The amenity floors are the reason the building works as a hotel as well as a residence: staffed and open through all four seasons.",
    canonical: "https://thenathiareserve.com/amenities",
    robots: "noindex, nofollow"
  },
  hero: {
    label: {
      no: "07",
      text: "The Estate"
    },
    title: [
      "Everything you need",
      [
        {
          em: "at 7,900 feet."
        }
      ]
    ],
    lede: "More than 25,000 sq ft across four dedicated levels. The amenity floors are the reason the building works as a hotel as well as a residence: staffed and open through all four seasons.",
    image: {
      img: "facade-terraces-pool",
      alt: "Cascading terraces and pool"
    }
  },
  sections: [
    {
      no: "01",
      title: [
        "Water"
      ],
      blocks: [
        {
          type: "list",
          items: [
            "Heated outdoor pool with swim up bar, open through the snow season",
            "Waterfall skylight plunge pools",
            "Hydrotherapy fountain hall"
          ]
        },
        {
          type: "image",
          img: "pool-sunset",
          alt: "The heated infinity pool at sunset"
        }
      ]
    },
    {
      no: "02",
      title: [
        "Spa & wellness"
      ],
      blocks: [
        {
          type: "list",
          items: [
            "Water curtain alpine spa",
            "Cedar sauna and steam rooms",
            "Zen yoga garden",
            "Fitness pavilion",
            "The salon"
          ]
        },
        {
          type: "image",
          img: "spa-curtain",
          alt: "Candlelit spa treatment hall"
        }
      ]
    },
    {
      no: "03",
      title: [
        "Dining"
      ],
      blocks: [
        {
          type: "list",
          items: [
            "Signature restaurant",
            "Terrace café",
            "Dining pods suspended in the forest canopy"
          ]
        },
        {
          type: "image",
          img: "pod-deck",
          alt: "Woven dining pod suspended over the forest canopy"
        }
      ]
    },
    {
      no: "04",
      title: [
        "The club"
      ],
      blocks: [
        {
          type: "list",
          items: [
            "Wood panelled cigar lounge",
            "Private boardroom"
          ]
        },
        {
          type: "image",
          img: "cigar-lounge",
          alt: "Wood panelled cigar lounge"
        }
      ]
    },
    {
      no: "05",
      title: [
        "The building"
      ],
      blocks: [
        {
          type: "list",
          items: [
            "Glass skywalk between the two towers",
            "Grand marble lobby",
            "Rooftop event terrace, bookable",
            "Covered arrival and valet parking"
          ]
        }
      ]
    },
    {
      no: "06",
      title: [
        "Service"
      ],
      blocks: [
        {
          type: "list",
          items: [
            "Owners’ concierge",
            "Housekeeping",
            "Full rental management desk",
            "Staffed and serviced through all four seasons"
          ]
        }
      ]
    },
    {
      no: "07",
      title: [
        "Open in winter"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "Heated interiors, covered arrival and a fully staffed estate mean the Reserve runs through November to March, when most of Nathia Gali closes. The heated outdoor pool stays open in the snow."
        },
        {
          type: "paragraph",
          text: "The rooftop event terrace on Tower B is bookable. There is no helipad: if you have seen one described elsewhere, it was removed from the scheme."
        },
        {
          type: "image",
          img: "facade-snow-night",
          alt: "The Reserve in snowfall at night"
        }
      ]
    }
  ],
  address: false
});
