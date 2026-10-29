import storeAssets from "./store-assets.mjs";
import portfolioAssets from "./portfolio-assets.mjs";
import batianAssets from "./batian-assets.mjs";
import tokodistributorAssets from "./tokodistributor-assets.mjs";

/** Content from the user's portfolio/CV brief; see CONTENT-SOURCES.md for limits. */
export const profile = {
  name: "Iddan Gunawan",
  title: "Mobile Engineer & Engineering Leader",
  email: "iddandunk@gmail.com",
  socials: [
    ["GitHub", "https://github.com/iddangunawan"],
    ["LinkedIn", "https://www.linkedin.com/in/iddan-gunawan/"],
    ["Medium", "https://medium.com/@iddandunk"],
  ],
};

/** @typedef {{slug:string,title:string,category:string,description:string,overview:string,role:string|null,technologies:string[],thumbnail:object|null,media:object|null,featured:boolean,art:string,symbol:string,gallery:Array<{src:string,width:number,height:number,alt:string}>,links:Array<{label:string,url:string}>,outcomes:string[],features:Array<{title:string,body:string}>,sections:Array<{title:string,body:string}>}} Project */
const project = (
  slug,
  title,
  category,
  description,
  art,
  symbol,
  extra = {},
) => ({
  slug,
  title,
  category,
  description,
  overview: description,
  art,
  symbol,
  role: null,
  dates: null,
  thumbnail:
    (storeAssets[slug] ?? portfolioAssets[slug])?.screenshots[
      slug === "sally-mobile" ? 2 : 0
    ] ?? null,
  media: storeAssets[slug] ?? portfolioAssets[slug] ?? null,
  technologies: [],
  featured: false,
  gallery: (storeAssets[slug] ?? portfolioAssets[slug])?.screenshots ?? [],
  links: storeAssets[slug]
    ? [{ label: "View on Google Play", url: storeAssets[slug].url }]
    : [],
  outcomes: [],
  features: [],
  sections: [],
  ...extra,
});
/** @type {Project[]} */
export const projects = [
  project(
    "koltitrace-mis",
    "KoltiTrace MIS",
    "Agritech",
    "Connecting the dots in agricultural supply-chain traceability.",
    "olive",
    "↗",
    {
      featured: true,
      overview:
        "KoltiTrace MIS supports supply-chain traceability. The documented Koltiva work includes Farm Gate, Farm Extension, and Koltipay, alongside mobile and connected-device engineering.",
      role: "Mobile engineering contributions across Koltiva products, including mobile/IoT connectivity, OTA research and development, and performance optimization.",
      sections: [
        {
          title: "Beyond the screen",
          body: "The role included device communication and research into over-the-air updates. These are responsibilities across the Koltiva portfolio; they are not presented as features of every KoltiTrace application.",
        },
      ],
    },
  ),
  project(
    "tokodistributor",
    "Tokodistributor",
    "Commerce",
    "Bringing B2B and O2O commerce into the hands of entrepreneurs.",
    "lilac",
    "t/",
    {
      featured: true,
      media: tokodistributorAssets,
      thumbnail: tokodistributorAssets.cover,
      gallery: tokodistributorAssets.screenshots,
      technologies: ["Android", "Kotlin"],
      overview:
        "A commerce platform combining business-to-business and online-to-offline models to support entrepreneurs and distributors.",
      role: "Android application delivery, usability improvements, custom interface development, and performance work.",
    },
  ),
  project(
    "aroundchess",
    "AroundChess",
    "Personal Projects",
    "A place to play, analyse, and find your next move.",
    "peach",
    "♞",
    {
      featured: true,
      overview:
        "A chess application featuring AI opponents, analysis, and chess training. The portfolio summary establishes the product context; implementation details and individual responsibilities are not yet documented.",
    },
  ),
  project(
    "globalpark",
    "GlobalPark",
    "Mobile",
    "Mobile tools for the everyday operations of parking management.",
    "blue",
    "P",
    {
      featured: true,
      overview:
        "GlobalPark combines parking operations and a digital wallet for end users, operators, and corporate users. The supplied presentation documents parking entry and exit, vehicle tracking, payments, maps, and reporting across iOS and Android.",
      role: "Credited as Senior Mobile Developer in the supplied GlobalPark presentation. The presentation documents the product’s technology and integrations; it does not attribute ownership of every feature.",
      technologies: ["Flutter", "Dart", "Firebase", "Mapbox"],
      sections: [
        {
          title: "Parking and payment workflows",
          body: "The documented product includes QR code scanning, Drive-In-Drive-Out vehicle tracking, digital wallet payments, and parking location maps. It supports end-user, operator, and corporate experiences.",
        },
        {
          title: "Platform integrations",
          body: "The presentation records Firebase analytics, messaging, notifications, and app distribution; DuitNow payment integration; JWT authentication; and encrypted local storage. These are documented product integrations, not independently audited security guarantees.",
        },
        {
          title: "Native experiences",
          body: "The presentation describes iOS home-screen widgets and Live Activities, along with camera, location, local notifications, file selection, and deep linking.",
        },
      ],
      links: [
        { label: "Product website", url: "https://globalpark.ai/" },
        {
          label: "Google Play",
          url: "https://play.google.com/store/apps/details?id=com.doublelogic.globalpark",
        },
        {
          label: "App Store",
          url: "https://apps.apple.com/my/app/globalpark/id6742808457",
        },
      ],
    },
  ),
  project(
    "manyoption",
    "ManyOption",
    "Mobile",
    "Everyday services and payments for apartment residents and beyond.",
    "olive",
    "M",
    {
      overview:
        "MOaja, the current name shown on ManyOption’s Google Play listing, is a lifestyle application that brings everyday services and payments together in one place. It supports apartment residents with IPL bill payments and apartment-related needs, while also offering services for household tasks, sports facility reservations, digital vouchers, and other payments.",
      features: [
        {
          title: "Apartment services",
          body: "IPL bill payments and apartment-related services.",
        },
        {
          title: "On-demand services",
          body: "Cleaning, shoe washing, car washing, and air-conditioning services.",
        },
        {
          title: "Sports reservations",
          body: "Find and book facilities for futsal, badminton, basketball, and other activities.",
        },
        {
          title: "Multi-payment",
          body: "Mobile credit and data packages, game vouchers, and BPJS Health bills.",
        },
        {
          title: "Everyday convenience",
          body: "Access multiple lifestyle services from one application.",
        },
      ],
      // TODO: Confirm ManyOption’s exact role title, project dates, and technology stack before adding them.
      role: "Development of multiple ManyOption applications at Nusantara Sukses Teknologi.",
      outcomes: [
        "The CV summary records a 25% increase in user engagement and a 30% decrease in crash rate under the Nusantara Sukses Teknologi experience. These figures describe that experience, not an individually measured application.",
      ],
    },
  ),
  project(
    "gaji-cermat",
    "Gaji Cermat",
    "Mobile",
    "Employee attendance, HR services, and payroll access connected to GajiCermat.",
    "blue",
    "g",
    {
      overview:
        "KerjaCermat is a mobile HRIS and employee management application connected to the GajiCermat platform. It helps employees and HR teams manage attendance, location-based check-ins, leave requests, work schedules, payslip access, and payroll history through a centralized digital experience.",
      features: [
        {
          title: "Face-recognition attendance",
          body: "Online employee attendance using facial recognition.",
        },
        {
          title: "GPS and location tracking",
          body: "Location-aware attendance and real-time location tracking, as described by the app listing.",
        },
        {
          title: "Leave management",
          body: "Submit leave requests and support approval workflows.",
        },
        {
          title: "Shift and working hours",
          body: "Access and manage work schedules and shifts.",
        },
        {
          title: "Payslip access",
          body: "View employee payslips from the app.",
        },
        { title: "Payroll history", body: "Review payroll history." },
        {
          title: "Integrated payroll",
          body: "Connect employee-facing payroll access with the integrated HRIS/payroll system.",
        },
      ],
      links: [
        {
          label: "View on Google Play",
          url: "https://play.google.com/store/apps/details?id=com.uangcermat.kerjacermatess&hl=id",
        },
        {
          label: "View on the App Store",
          url: "https://apps.apple.com/id/app/kerjacermat/id1629850957",
        },
      ],
      // TODO: Confirm Gaji Cermat / KerjaCermat project-specific responsibilities, dates, and stack; the verified employment record remains in the timeline.
    },
  ),
  project(
    "gardaku",
    "GardaKu",
    "Mobile",
    "Security workforce operations, field activity tracking, and reporting connected to GajiCermat.",
    "plum",
    "G",
    {
      overview:
        "GardaKu is a security workforce management application integrated with the GajiCermat HRIS platform. It helps security service providers monitor field activities, document operational work, coordinate teams, and manage security operations through digital tracking and reporting tools.",
      features: [
        {
          title: "Activity tracking",
          body: "Monitor security personnel activities and operational progress.",
        },
        {
          title: "GPS tagging",
          body: "Associate field activities with location information.",
        },
        {
          title: "Asset management",
          body: "Support the management and tracking of operational assets.",
        },
        {
          title: "QR-code scanning",
          body: "Use QR scanning as part of operational workflows.",
        },
        {
          title: "Team coordination",
          body: "Help supervisors coordinate security personnel.",
        },
        {
          title: "Workflow management",
          body: "Support operational processes and task flows.",
        },
        {
          title: "Activity reporting",
          body: "Document and report field activities for operational monitoring.",
        },
      ],
      // TODO: Confirm GardaKu-specific responsibilities, role, project dates, and technology stack before adding personal contribution details.
    },
  ),
  project(
    "bebas-akuntansi",
    "Bebas Akuntansi",
    "Fintech",
    "Cloud accounting for everyday business finances.",
    "yellow",
    "B",
  ),
  project(
    "emitra",
    "emitra",
    "Commerce",
    "B2B mobile shopping connecting distributors with wholesale buyers and retail outlets.",
    "peach",
    "e",
    {
      overview:
        "emitra is a B2B e-commerce application that connects distributors with retail outlets, from wholesale buyers to smaller retailers. It enables business customers to order products directly from official distributors, access distributor pricing and promotions, and manage wholesale purchasing through a convenient mobile shopping experience.",
      features: [
        {
          title: "B2B wholesale shopping",
          body: "Order products directly from participating distributors.",
        },
        {
          title: "Distributor pricing",
          body: "Access distributor-specific prices.",
        },
        {
          title: "Promotions and discounts",
          body: "Discover available distributor offers.",
        },
        {
          title: "Product variety",
          body: "Browse products offered through the distributor network.",
        },
        {
          title: "Delivery benefits",
          body: "Free shipping is advertised; check the applicable offer terms for eligibility.",
        },
        {
          title: "Cash on delivery",
          body: "COD is available as a listed payment option.",
        },
        {
          title: "Order tracking",
          body: "Stay informed with real-time order status updates, as described by eDOT.",
        },
        {
          title: "Convenient ordering",
          body: "Place orders through a streamlined mobile shopping experience.",
        },
      ],
      // TODO: Confirm emitra-specific responsibilities, role, project dates, and technology stack before adding personal contribution details.
    },
  ),
  project(
    "hris-ethos",
    "HRIS ETHOS",
    "Mobile",
    "A dedicated mobile interface for HR processes at Ethos Waizly.",
    "lilac",
    "H",
    {
      overview:
        "HRIS ETHOS is an internal Human Resource Information System application for Ethos Waizly. It provides a mobile interface for employees and authorized users to interact with the organization’s HR processes. The project focuses on bringing HR-related workflows into a dedicated mobile application.",
      features: [
        {
          title: "Account sign-in",
          body: "The published screenshot shows email and password sign-in.",
        },
        {
          title: "Password recovery",
          body: "The published password reset screen requests an email address to send a reset link.",
        },
        {
          title: "Attendance history",
          body: "The published history screen shows monthly records with check-in and check-out times.",
        },
      ],
      // TODO: Confirm HRIS ETHOS-specific responsibilities, role, project dates, and technology stack before adding personal contribution details.
    },
  ),
  project(
    "guide",
    "GUIDE",
    "Mobile",
    "Clinical scoring and protocol compliance reference tools for hospital quality assurance teams.",
    "olive",
    "+",
    {
      overview:
        "GUIDE by DoubleLogic is a clinical scoring and compliance reference application designed for hospital quality assurance teams. It helps healthcare professionals monitor patients against clinical practice guidelines, calculate standardized clinical scores, and review whether required protocol steps are completed within defined time windows.",
      features: [
        {
          title: "Patient monitoring",
          body: "View and search monitored patients, with filters for compliance status and protocol type.",
        },
        {
          title: "Patient details",
          body: "Review patient demographics, admission information, and current protocol compliance status.",
        },
        {
          title: "NEWS2 calculator",
          body: "Calculate National Early Warning Score 2 from seven vital-sign parameters and view the resulting risk classification.",
        },
        {
          title: "Stroke vital-sign calculator",
          body: "Review stroke-related vital-sign compliance against configured clinical guideline thresholds.",
        },
        {
          title: "Compliance dashboard",
          body: "Review aggregated compliance summaries by department and time period.",
        },
        {
          title: "Compliance details",
          body: "Inspect completed, pending, and missed protocol steps against defined time thresholds.",
        },
      ],
      sections: [
        {
          title: "Clinical reference",
          body: "GUIDE is a clinical reference and compliance tool for trained healthcare professionals. It does not replace clinical judgment or the treating healthcare professional’s decisions. It does not diagnose or treat patients.",
        },
      ],
      // TODO: Confirm GUIDE-specific responsibilities, role, project dates, and technology stack before adding personal contribution details.
    },
  ),
  project(
    "woku",
    "WoKu",
    "Mobile",
    "Employee management, workforce operations, and operational reporting by DoubleLogic.",
    "blue",
    "W",
    {
      overview:
        "WoKu is an all-in-one employee management application developed by DoubleLogic for businesses across industries. It connects employees and organizations through a mobile experience for workforce operations, attendance, and access to operational information and performance reports.",
      features: [
        {
          title: "Employee management",
          body: "A centralized employee-facing application for business workforce operations.",
        },
        {
          title: "Attendance",
          body: "Attendance-related functionality is identified in the official release notes.",
        },
        {
          title: "Daily reporting",
          body: "Date-based reports provide visibility into daily operational and financial activity.",
        },
        {
          title: "Dashboard insights",
          body: "Access operational summaries and app statistics through dashboard charts.",
        },
        {
          title: "CRM dashboard reporting",
          body: "Review monthly ticket summaries and comparison charts in a dedicated reporting screen.",
        },
      ],
      // TODO: Confirm WoKu-specific responsibilities, role, project dates, and technology stack before adding personal contribution details.
    },
  ),
  project(
    "sentry-nurse",
    "SENTRY Nurse by DoubleLogic",
    "Mobile",
    "Factory infirmary workflows for authorized nurses, from assigned shifts to patient encounters and daily tasks.",
    "blue",
    "S",
    {
      overview:
        "SENTRY Nurse by DoubleLogic is a mobile application for authorized nurses working at factory infirmaries. It brings assigned shifts, on-site check-in and check-out, daily tasks, and patient encounter records into a dedicated mobile workflow.",
      features: [
        {
          title: "Shifts and attendance",
          body: "Review assigned shifts and record on-site check-in and check-out.",
        },
        {
          title: "Daily tasks",
          body: "Review the day’s nursing tasks and their progress from the home dashboard.",
        },
        {
          title: "Patient encounters",
          body: "Record patient information, complaints, vital signs, treatment, and medication dispensed during a visit.",
        },
        {
          title: "Reports and history",
          body: "Review workplace and date-based reports, patient encounter summaries, and attendance history.",
        },
        {
          title: "Medication inventory",
          body: "Review medication stock levels and stock requests at an assigned workplace.",
        },
        {
          title: "Equipment checks",
          body: "Review equipment records and their check statuses.",
        },
        {
          title: "Incident protocols and guidelines",
          body: "Follow configured incident protocol steps and access treatment guidelines.",
        },
      ],
      sections: [
        {
          title: "Access and scope",
          body: "An account and an assigned workplace are required. Available features depend on the organization’s configuration and the user’s role.",
        },
      ],
      // TODO: Confirm SENTRY Nurse-specific responsibilities, role, project dates, and technology stack before adding personal contribution details.
    },
  ),
  project(
    "masskredit",
    "Masskredit",
    "Fintech",
    "A platform connecting investors and borrowers.",
    "lilac",
    "m",
  ),
  project(
    "sally-mobile",
    "Sally Mobile",
    "Fintech",
    "Less paperwork. A smoother path to financing submissions.",
    "plum",
    "S",
    {
      featured: true,
      technologies: ["Android", "Kotlin"],
      overview:
        "Sally Mobile is a mobile workflow automation application for financing submissions at KB Finansia Multi Finance.",
      role: "Android development, REST API backend work, collaboration with UI designers, and investigation and resolution of system issues.",
      outcomes: [
        "Resolved more than 20 system issues, as recorded in the supplied CV summary.",
      ],
    },
  ),
  project(
    "batian",
    "Batian",
    "Fintech",
    "Simple financial records for the smallest businesses.",
    "yellow",
    "b.",
    {
      featured: true,
      media: batianAssets,
      thumbnail: batianAssets.cover,
      gallery: batianAssets.screenshots,
      technologies: ["Android"],
      overview:
        "Batian is a smartphone-based financial-recording and point-of-sale application for micro-businesses. Its product context focuses on practical, approachable financial records.",
      role: "Android application development at SRDStudio. The documented role also included collaboration with UI designers, application maintenance, debugging, and secure storage and authentication work across its applications.",
    },
  ),
];

export const capabilities = [
  [
    "01",
    "Native at heart.",
    "Mobile engineering",
    [
      "Kotlin",
      "Java",
      "Android SDK",
      "Jetpack Compose",
      "Android architecture",
    ],
  ],
  [
    "02",
    "Across platforms.",
    "Cross-platform development",
    ["Flutter", "Dart", "React Native", "React"],
  ],
  [
    "03",
    "Strong foundations.",
    "Architecture & data",
    [
      "REST API integration",
      "Reusable components",
      "Secure data storage",
      "Authentication",
    ],
  ],
  [
    "04",
    "Built to connect.",
    "Connected devices",
    [
      "BLE / Bluetooth",
      "IoT connectivity",
      "Device communication",
      "OTA workflows",
    ],
  ],
  [
    "05",
    "Made to last.",
    "Engineering quality",
    [
      "Performance optimization",
      "Debugging",
      "UI collaboration",
      "Maintainability",
      "CI/CD",
    ],
  ],
];

export const experience = [
  {
    company: "Koltiva",
    title: "Principal Engineer (Mobile)",
    dates: "Mar 2024 — Nov 2024",
    summary:
      "KoltiTrace MIS Farm Gate, Farm Extension, and Koltipay. Mobile/IoT connectivity, OTA R&D, and performance optimization.",
    responsibilities: [
      "Connected IoT devices with mobile applications.",
      "Researched over-the-air updates for IoT devices through mobile apps.",
      "Optimized software performance and enhanced existing Android application functionality.",
    ],
    verifiedTitle: true,
  },
  {
    company: "PT. KB Finansia Multi Finance",
    title: "Senior Android Developer",
    dates: "Jun 2023 — Feb 2024",
    summary:
      "Sally Mobile, REST API backend work, and cross-functional UI collaboration.",
    responsibilities: [
      "Developed mobile interfaces and optimized application performance.",
      "Collaborated with cross-functional design and development teams.",
      "Created and implemented a RESTful API backend for an Android application.",
    ],
    verifiedTitle: true,
  },
  {
    company: "Tokodistributor - B2B Marketplace",
    title: "Senior Android Developer",
    dates: "Mar 2020 — May 2023",
    note: "The December 2024 résumé records Mar 2020–May 2023. Indexed LinkedIn lists Android Developer, Jun 2022–May 2023. Both records are retained; the résumé period overlaps other listed roles.",
    summary:
      "Android application delivery, custom interfaces, usability, and performance.",
    responsibilities: [
      "Delivered an Android application from initial concept through production.",
      "Improved navigation and maintained alignment with Android standards.",
      "Optimized existing applications and developed custom Android interfaces.",
    ],
    verifiedTitle: true,
  },
  {
    company: "PT. Bridgenote Asia",
    title: "Senior Mobile Developer",
    dates: "Jan 2022 — May 2022",
    summary: "Bebas Akuntansi: mobile development for cloud accounting.",
    verifiedTitle: true,
  },
  {
    company: "PT. Gajicermat Mandiri Digital Indonesia",
    title: "Senior Frontend Developer",
    dates: "Jul 2021 — Dec 2021",
    summary: "Frontend development for payroll and HR products.",
    verifiedTitle: true,
  },
  {
    company: "Nusantara Sukses Teknologi",
    title: "Mobile application development",
    dates: null,
    summary:
      "Multiple ManyOption applications, with engagement and crash-rate improvements documented in the CV summary.",
    verifiedTitle: false,
  },
  {
    company: "SRDStudio",
    title: "Android Developer",
    dates: "Aug 2017 — Mar 2020",
    summary:
      "Batian and other Android applications, from UI collaboration to maintenance and performance.",
    verifiedTitle: true,
  },
];

export const writing = [
  {
    title: "Mengenal dan Menggunakan Dagger Hilt dengan KSP di Android",
    description:
      "A practical look at dependency injection with Dagger Hilt and Kotlin Symbol Processing. Written in Indonesian.",
    url: "https://medium.com/@iddandunk/mengenal-dan-menggunakan-dagger-hilt-dengan-ksp-di-android-b5107363b082",
    tags: ["Android", "Dependency injection"],
  },
];
