// /nathia/residences: text and structure as rendered on thenathiareserve.com/residences (owner-approved copy, CLAUDE.md §12).
// Generated from the live page's rendered DOM; edit by hand from here on. The closing CTA is shared (site.pageCta).
import { innerPageSchema, lazyParse } from "../schema";

export const getResidencesPage = () => parse();

const parse = lazyParse(innerPageSchema, {
  slug: "/nathia/residences",
  meta: {
    title: "The Residences — 133 Apartments, Studios to Penthouses | The Nathia Reserve",
    description: "133 residences in total, across two towers joined by a glass skywalk. Every unit is sold: Elevate Holdings retains none for itself.",
    canonical: "https://thenathiareserve.com/residences",
    robots: "noindex, nofollow"
  },
  hero: {
    label: {
      no: "06",
      text: "The Residences"
    },
    title: [
      "One hundred and",
      [
        {
          em: "thirty three."
        }
      ]
    ],
    lede: "133 residences in total, across two towers joined by a glass skywalk. Every unit is sold: Elevate Holdings retains none for itself.",
    action: "Browse every residence in 3D",
    image: {
      img: "res-pent-living",
      alt: "Penthouse living room at dusk"
    }
  },
  sections: [
    {
      no: "01",
      title: [
        "The mix"
      ],
      blocks: [
        {
          type: "table",
          columns: [
            "Residence",
            "Units",
            "Area · sq ft",
            "Price",
            "Notes"
          ],
          rows: [
            [
              "Studio",
              "12",
              "390 to 416",
              "Sold out",
              "A single, efficient mountain room: the entry into the Reserve."
            ],
            [
              "1 Bedroom",
              "74",
              "607 to 1,170",
              "From PKR 3.9 crore",
              "The core of the building, and the most flexible to let."
            ],
            [
              "2 Bedroom",
              "27",
              "1,056 to 2,305",
              "From PKR 7.1 crore",
              "Family scale residences with dual aspect on most floors."
            ],
            [
              "3 Bedroom",
              "12",
              "1,856 to 2,189",
              "From PKR 12.5 crore",
              "The deepest plates in the building."
            ],
            [
              "Penthouse",
              "8",
              "2,291 to 3,714",
              "From PKR 20 crore",
              "Each carries its own heated terrace pool, held over the valley: the highest private residences in the Galiyat."
            ]
          ]
        }
      ]
    },
    {
      no: "02",
      title: [
        "What comes with the residence"
      ],
      blocks: [
        {
          type: "list",
          items: [
            "Finished and furnished to an apartment hotel standard, ready to occupy or to let.",
            "Full access to the amenity floors: spa, pools, restaurant, skywalk, event terrace.",
            "Managed within the Reserve's own hotel operation: every residence is in the programme.",
            "Owners' concierge and housekeeping, year round."
          ]
        },
        {
          type: "image",
          img: "int-1bed-living",
          alt: "Open plan one bedroom living space"
        }
      ]
    },
    {
      no: "03",
      title: [
        "Penthouses"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "The eight penthouses occupy the top of the building, from 2,291 to 3,714 sq ft, with private terrace pools and the full sweep of the valley. They are the last stock released and are not part of the early founders’ allocation."
        },
        {
          type: "image",
          img: "res-pent",
          alt: "Sky Penthouse private plunge pool terrace overlooking the valley at dusk"
        }
      ]
    },
    {
      no: "04",
      title: [
        "Choosing a residence"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "Aspect matters more here than floor number. Units facing the valley carry the long view toward Abbottabad; units facing the ridge look into protected forest that cannot be built out. Corner units carry two aspects."
        },
        {
          type: "paragraph",
          text: "Floor plates, orientation and the full unit schedule are walked through individually with registered founders."
        }
      ]
    },
    {
      no: "05",
      title: [
        "On pricing"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "The prices above are starting prices; the studios are sold out. The payment schedule is released directly to the founders’ list ahead of public launch. Any price you see for this project on a third party website is not issued by Elevate Holdings."
        }
      ]
    }
  ],
  address: false
});
