// /nathia/location: text and structure as rendered on thenathiareserve.com/location (owner-approved copy, CLAUDE.md §12).
// Generated from the live page's rendered DOM; edit by hand from here on. The closing CTA is shared (site.pageCta).
import { innerPageSchema, lazyParse } from "../schema";

export const getLocationPage = () => parse();

const parse = lazyParse(innerPageSchema, {
  slug: "/nathia/location",
  meta: {
    title: "Where Is The Nathia Reserve? Location, Map & Drive Times | Nathia Gali",
    description: "On the main Nathia Gali road in the Galiyat, Khyber Pakhtunkhwa, at roughly 7,900 ft (2,400 m) above sea level, backing onto the protected pine forest of Ayubia National Park.",
    canonical: "https://thenathiareserve.com/location",
    robots: "noindex, nofollow"
  },
  hero: {
    label: {
      no: "04",
      text: "Location"
    },
    title: [
      "You arrive",
      [
        {
          em: "at the door."
        }
      ]
    ],
    lede: "On the main Nathia Gali road in the Galiyat, Khyber Pakhtunkhwa, at roughly 7,900 ft (2,400 m) above sea level, backing onto the protected pine forest of Ayubia National Park.",
    image: {
      img: "aerial-curve",
      alt: "Aerial view of the Reserve on the ridge"
    }
  },
  sections: [
    {
      no: "01",
      title: [
        "The pin"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "A dozen schemes in 2026 are marketed under the Nathia Gali name and most of them are five to fifteen kilometres away. So here is the plot itself, on Google Maps — on the main road at the crest, backing onto the protected forest."
        },
        {
          type: "link",
          label: "Open The Nathia Reserve in Google Maps",
          href: "https://www.google.com/maps/place/The+Nathia+Reserve/@34.0725156,73.3815342,17z/data=!4m6!3m5!1s0x38de2b002e43469d:0xc97b7b8f6e1bb2d8!8m2!3d34.0725156!4d73.3815342",
          note: "Plus code 39CJ+QQW, Nathia Gali. Check the road distance from the bazaar against anything else you are shown."
        }
      ]
    },
    {
      no: "02",
      title: [
        "The address"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "It is the only development of its kind directly on the main road: you arrive at the door rather than climbing a private track."
        }
      ]
    },
    {
      no: "03",
      title: [
        "Getting there"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "Nathia Gali lies on the Murree to Abbottabad road, roughly midway between the two. Approximate driving distances, which vary with weather and season:"
        },
        {
          type: "table",
          columns: [
            "From",
            "Distance",
            "Typical drive"
          ],
          rows: [
            [
              "Ayubia",
              "~7 km",
              "~20 minutes"
            ],
            [
              "Murree",
              "~35 km",
              "~1 to 1.5 hours"
            ],
            [
              "Abbottabad",
              "~35 km",
              "~1 to 1.5 hours"
            ],
            [
              "Islamabad / Rawalpindi",
              "~80 km",
              "~2.5 to 3 hours"
            ],
            [
              "Islamabad Intl. Airport",
              "~100 km",
              "~3 hours"
            ]
          ]
        },
        {
          type: "paragraph",
          text: "The Murree to Nathia road is maintained through winter, though heavy snow can slow the final stretch. The Reserve keeps covered arrival and valet parking for exactly that reason."
        }
      ]
    },
    {
      no: "04",
      title: [
        "The view"
      ],
      blocks: [
        {
          type: "list",
          items: [
            "To the left: the Ayubia and Murree mountains.",
            "To the right: the valley falling away toward Abbottabad.",
            "On clear nights: the lights of Wah Cantt, far below.",
            "Directly behind: unbroken protected pine forest. It cannot be built out."
          ]
        },
        {
          type: "paragraph",
          text: "Because the plot is bordered by national park land, the forest frontage is permanent. The outlook is protected by law, not by a neighbour’s goodwill."
        },
        {
          type: "image",
          img: "facade-tower-sunset",
          alt: "The tower at sunset"
        }
      ]
    },
    {
      no: "05",
      title: [
        "Why Nathia Gali"
      ],
      blocks: [
        {
          type: "paragraph",
          text: "Nathia Gali is the highest and most established of the Galiyat hill stations, and the one that holds visitors through all four seasons rather than only in summer. It draws domestic tourism from Islamabad and Punjab, and increasingly from the Pakistani diaspora."
        },
        {
          type: "paragraph",
          text: "The Reserve holds Galiyat Development Authority (GDA) approval, EPA Khyber Pakhtunkhwa environmental approval, Forest Department clearance. Site works are underway."
        }
      ]
    }
  ],
  address: true
});
