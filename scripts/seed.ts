/**
 * OFI research corpus seed — curated, verified public NASA / peer-reviewed
 * records for microgravity combustion investigations.
 *
 * Rules enforced in this file:
 *  - launchYear is only set when a public source states it.
 *  - DOI is only set when verified (currently the SAME moment-method paper).
 *  - No numeric experimental measurements are stored. Visualization Lab
 *    charts are computed from record metadata only.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type SeedSource = {
  title: string;
  authors: string;
  year?: number;
  venue: string;
  kind: "report" | "journal" | "web" | "news";
  doi?: string;
  url?: string;
};

type SeedRecord = {
  code: string;
  name: string;
  category: string;
  objective: string;
  summary: string;
  gravityCondition: string;
  facility: string;
  platform: string;
  status: string;
  launchYear?: number;
  delivery?: string;
  researchAreas: string[];
  fuelsMaterials: string[];
  keyFindings: string[];
  variables: { name: string; unit: string | null }[];
  doi?: string;
  sourceUrl?: string;
  ntrsUrl?: string;
  datasetAvailable: boolean;
  measurementData: boolean;
  sources: SeedSource[];
};

const CORPUS: SeedRecord[] = [
  {
    code: "FLEX",
    name: "Flame Extinguishment Experiment",
    category: "Droplet Combustion",
    objective:
      "Assess and quantify the effectiveness of inert-gas fire suppressants in microgravity by studying the combustion and extinction of isolated fuel droplets.",
    summary:
      "FLEX is a droplet combustion experiment performed on the International Space Station inside the Combustion Integrated Rack. Single unsupported fuel droplets were ignited and burned in inert-gas atmospheres while high-resolution imaging recorded droplet diameter history and flame behaviour. The experiment revealed that some droplets continue to burn after the visible hot-flame extinguishes — so-called cool-flame burning — a two-stage combustion regime that is largely hidden on Earth by buoyancy.",
    gravityCondition: "Microgravity (ISS)",
    facility: "Combustion Integrated Rack (CIR)",
    platform: "International Space Station",
    status: "Completed",
    launchYear: 2009,
    researchAreas: ["Droplet combustion", "Fire suppression", "Cool flames", "Flame extinction"],
    fuelsMaterials: ["n-Heptane", "Methanol", "Ethanol", "Inert suppressant atmospheres (N2, CO2, He)"],
    keyFindings: [
      "Post-visible-extinction 'cool flame' burning was observed for heptane droplets, indicated by a plateau in the droplet-diameter history after the hot flame extinguished.",
      "Inert-gas suppressant effectiveness in microgravity differs from normal-gravity behaviour, informing spacecraft fire-suppression design.",
    ],
    variables: [
      { name: "Droplet diameter history", unit: "mm" },
      { name: "Flame standoff ratio", unit: "dimensionless" },
      { name: "Burning rate constant (d-squared law)", unit: "mm²/s" },
      { name: "Ambient oxygen concentration", unit: "% vol" },
    ],
    sourceUrl: "https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf",
    ntrsUrl: "https://ntrs.nasa.gov/api/citations/20150023456/downloads/20150023456.pdf",
    datasetAvailable: true,
    measurementData: true,
    sources: [
      {
        title: "Droplet Combustion Experiments Aboard the International Space Station (FLEX overview)",
        authors: "D. L. Dietrich et al.",
        year: 2014,
        venue: "Microgravity Science and Technology (overview article, cited 140+)",
        kind: "journal",
        url: "https://bpb-us-w2.wpmucdn.com/sites.coecis.cornell.edu/dist/9/231/files/2018/09/2014-MST-Droplet-combustion-experiments-aboard-the-2je8ess-12toi72.pdf",
      },
      {
        title: "Detailed Results From the Flame Extinguishment Experiment (FLEX)",
        authors: "NASA Glenn Research Center",
        year: 2015,
        venue: "NASA Technical Reports Server, citation 20150023456",
        kind: "report",
        url: "https://ntrs.nasa.gov/api/citations/20150023456/downloads/20150023456.pdf",
      },
    ],
  },
  {
    code: "FLEX-2",
    name: "Flame Extinguishment Experiment-2",
    category: "Droplet Combustion",
    objective:
      "Advance droplet-combustion research by studying the influence of sub-buoyant convective flows on combustion rates and transient liquid and gas-phase phenomena, using fuels and environments that mimic real combustor conditions.",
    summary:
      "FLEX-2 extends the FLEX droplet-combustion series. Binary fuel mixtures and controlled convective environments are used to study multicomponent droplet vaporization, flame stability and extinction. Results support verified detailed and reduced-order models of droplet combustion, including flow-field effects relevant to practical combustors.",
    gravityCondition: "Microgravity (ISS)",
    facility: "Combustion Integrated Rack (CIR)",
    platform: "International Space Station",
    status: "Completed",
    researchAreas: ["Droplet combustion", "Multicomponent fuels", "Convective flows", "Combustion modelling"],
    fuelsMaterials: ["Binary fuel mixtures", "Alkane fuels"],
    keyFindings: [
      "Experimental data supports development of verified detailed and reduced-order droplet combustion models including flow-field effects.",
    ],
    variables: [
      { name: "Droplet diameter history", unit: "mm" },
      { name: "Convective flow velocity", unit: "mm/s" },
      { name: "Flame diameter", unit: "mm" },
    ],
    sourceUrl: "https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf",
    datasetAvailable: true,
    measurementData: true,
    sources: [
      {
        title: "Flame Extinguishment Experiment (FLEX) and FLEX-2 — NASA mission summary",
        authors: "NASA",
        venue: "NASA Glenn Research Center",
        kind: "web",
        url: "https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf",
      },
    ],
  },
  {
    code: "SAFFIRE-I",
    name: "Spacecraft Fire Experiment-I",
    category: "Spacecraft Fire Safety",
    objective:
      "Understand flame spread and growth over large surfaces in low gravity and determine whether a limiting flame size exists, informing spacecraft material selection and fire-safety criteria.",
    summary:
      "SAFFIRE-I burned a single 40 cm × 100 cm sample of SIBAL cloth (a fiberglass/cotton blend) inside an uncrewed Orbital ATK Cygnus cargo vehicle during its free-flight phase, making it the largest deliberately ignited fire in space. Telemetry and imagery were downlinked before Cygnus's destructive reentry. The experiment validates NASA's material flammability criteria in long-duration low gravity.",
    gravityCondition: "Microgravity (free-flying spacecraft)",
    facility: "SAFFIRE flow duct inside Cygnus cargo module",
    platform: "Cygnus CRS OA-6 (SS Rick Husband)",
    status: "Completed",
    launchYear: 2016,
    delivery: "Orbital ATK Cygnus OA-6, launched 23 March 2016",
    researchAreas: ["Flame spread", "Spacecraft fire safety", "Material flammability", "Flammability limits"],
    fuelsMaterials: ["SIBAL cloth (75% cotton / 25% fiberglass), 40 cm × 100 cm"],
    keyFindings: [
      "Largest man-made fire in space (~41 cm × 94 cm burning region reported in mission coverage).",
      "Flame spread over a large solid sample was sustained in low gravity; data used to assess limiting flame size and material selection criteria.",
    ],
    variables: [
      { name: "Flame spread rate", unit: "cm/s" },
      { name: "Sample surface temperature", unit: "°C" },
      { name: "Ambient flow velocity", unit: "cm/s" },
    ],
    sourceUrl: "https://www.eoportal.org/satellite-missions/saffire",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "SAFFIRE (Spacecraft Fire Experiment) — EO Portal mission description",
        authors: "EO Portal editorial team",
        year: 2016,
        venue: "eoPortal.org",
        kind: "web",
        url: "https://www.eoportal.org/satellite-missions/saffire",
      },
      {
        title: "First large fire experiment aboard spacecraft a success",
        authors: "USRA / NASA",
        year: 2016,
        venue: "USRA news release",
        kind: "news",
      },
    ],
  },
  {
    code: "SAFFIRE-II",
    name: "Spacecraft Fire Experiment-II",
    category: "Spacecraft Fire Safety",
    objective:
      "Investigate low-gravity Maximum Oxygen Concentration (MOC) flammability limits in long-term low gravity, determining whether flames on nine different thin materials propagate or self-extinguish.",
    summary:
      "SAFFIRE-II flew a set of nine thin material samples, each 5 cm × 30 cm, inside a Cygnus cargo spacecraft. Samples spanned different materials and oxygen/flow conditions so the experiment could map which combinations support flame propagation in long-duration microgravity — data directly relevant to spacecraft material screening standards.",
    gravityCondition: "Microgravity (free-flying spacecraft)",
    facility: "SAFFIRE flow duct inside Cygnus cargo module",
    platform: "Cygnus cargo spacecraft",
    status: "Completed",
    researchAreas: ["Flammability limits", "Spacecraft fire safety", "Material flammability", "Oxygen concentration"],
    fuelsMaterials: ["Nine thin-fuel samples (5 cm × 30 cm), various spacecraft materials"],
    keyFindings: [
      "Mapped propagation versus self-extinguishment outcomes across nine material samples in long-duration low gravity.",
    ],
    variables: [
      { name: "Oxygen concentration", unit: "% vol" },
      { name: "Flame spread rate", unit: "cm/s" },
    ],
    sourceUrl: "https://www.eoportal.org/satellite-missions/saffire",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "SAFFIRE (Spacecraft Fire Experiment) — EO Portal mission description",
        authors: "EO Portal editorial team",
        year: 2016,
        venue: "eoPortal.org",
        kind: "web",
        url: "https://www.eoportal.org/satellite-missions/saffire",
      },
    ],
  },
  {
    code: "SAFFIRE-III",
    name: "Spacecraft Fire Experiment-III",
    category: "Spacecraft Fire Safety",
    objective:
      "Quantify flame development over a large sample in low gravity, repeating the SAFFIRE-I large-sample configuration with refined instrumentation.",
    summary:
      "SAFFIRE-III repeated the SAFFIRE-I configuration — a single 40 cm × 100 cm SIBAL cloth sample — inside another Cygnus cargo vehicle, providing a second large-scale flame-spread dataset in long-duration microgravity. Together SAFFIRE-I and SAFFIRE-III examine whether flame spread over large samples reaches a steady size or continues to grow.",
    gravityCondition: "Microgravity (free-flying spacecraft)",
    facility: "SAFFIRE flow duct inside Cygnus cargo module",
    platform: "Cygnus cargo spacecraft",
    status: "Completed",
    researchAreas: ["Flame spread", "Spacecraft fire safety", "Flammability limits"],
    fuelsMaterials: ["SIBAL cloth (75% cotton / 25% fiberglass), 40 cm × 100 cm"],
    keyFindings: [
      "Second large-sample flame-spread dataset confirming the SAFFIRE-I experimental approach.",
    ],
    variables: [
      { name: "Flame spread rate", unit: "cm/s" },
      { name: "Sample surface temperature", unit: "°C" },
    ],
    sourceUrl: "https://www.eoportal.org/satellite-missions/saffire",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "SAFFIRE (Spacecraft Fire Experiment) — EO Portal mission description",
        authors: "EO Portal editorial team",
        year: 2016,
        venue: "eoPortal.org",
        kind: "web",
        url: "https://www.eoportal.org/satellite-missions/saffire",
      },
    ],
  },
  {
    code: "SAFFIRE-VI",
    name: "Spacecraft Fire Experiment-VI",
    category: "Spacecraft Fire Safety",
    objective:
      "Extend spacecraft fire-safety demonstrations with longer, stronger flames and additional instrumentation aboard a Cygnus vehicle, covering flame spread, flame self-extinguishment, fire detection and suppression.",
    summary:
      "Preliminary results from SAFFIRE-VI were reported by D. L. Urban and colleagues (2024). The experiment was conducted on an orbiting Cygnus spacecraft and continued the SAFFIRE series' examination of flame behaviour at spacecraft scale.",
    gravityCondition: "Microgravity (free-flying spacecraft)",
    facility: "SAFFIRE flow duct inside Cygnus cargo module",
    platform: "Cygnus cargo spacecraft",
    status: "Preliminary Results",
    launchYear: 2024,
    researchAreas: ["Flame spread", "Fire detection", "Fire suppression", "Spacecraft fire safety"],
    fuelsMaterials: ["Solid fabric samples"],
    keyFindings: [
      "Preliminary results published by D. L. Urban et al. (2024) covering flame spread, self-extinguishment, detection and suppression aspects.",
    ],
    variables: [{ name: "Flame spread rate", unit: "cm/s" }],
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Preliminary Results from the SAFFIRE-VI Experiment",
        authors: "D. L. Urban et al.",
        year: 2024,
        venue: "Peer-reviewed publication (cited 4)",
        kind: "journal",
      },
    ],
  },
  {
    code: "BASS",
    name: "Burning and Suppression of Solids",
    category: "Solid Fuel",
    objective:
      "Guide strategies for extinguishing accidental fires in microgravity and contribute to the combustion computational models used to design spacecraft fire detection and suppression systems.",
    summary:
      "BASS burned thin solid fuel samples inside the Microgravity Science Glovebox on the ISS while a controlled airflow swept across the sample. The experiment studied how solid materials burn and how suppressants interact with the flame in microgravity, where buoyant flows are absent and flame behaviour differs fundamentally from Earth.",
    gravityCondition: "Microgravity (ISS)",
    facility: "Microgravity Science Glovebox (MSG)",
    platform: "International Space Station",
    status: "Completed",
    researchAreas: ["Solid-fuel combustion", "Fire suppression", "Flame spread over solids"],
    fuelsMaterials: ["Thin solid fuel samples (paper, plastics, fabric)"],
    keyFindings: [
      "Results guide strategies for extinguishing accidental fires in microgravity.",
      "Feeds combustion computational models used in spacecraft fire detection and suppression design.",
    ],
    variables: [
      { name: "Flame spread rate", unit: "cm/s" },
      { name: "Ambient flow velocity", unit: "cm/s" },
    ],
    sourceUrl: "https://issnationallab.org/facilities/burning-and-suppression-of-solids",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Burning and Suppression of Solids — ISS National Laboratory facility page",
        authors: "ISS National Laboratory",
        venue: "issnationallab.org",
        kind: "web",
        url: "https://issnationallab.org/facilities/burning-and-suppression-of-solids",
      },
    ],
  },
  {
    code: "BASS-II",
    name: "Burning and Suppression of Solids-II",
    category: "Solid Fuel",
    objective:
      "Study microgravity combustion of thin fuels with controlled forced flow, focusing on how flow affects flammability limits and flame behaviour relevant to fire detection and suppression in microgravity.",
    summary:
      "BASS-II was performed on the International Space Station, burning thin fuel samples in microgravity with controlled forced airflow. Results contribute to the combustion computational models used in the design of fire detection and suppression systems for microgravity environments and were compared against normal-gravity screening tests.",
    gravityCondition: "Microgravity (ISS)",
    facility: "Microgravity Science Glovebox (MSG)",
    platform: "International Space Station",
    status: "Completed",
    researchAreas: ["Solid-fuel combustion", "Flammability limits", "Fire suppression"],
    fuelsMaterials: ["Thin solid fuel samples"],
    keyFindings: [
      "BASS-II results contribute to combustion computational models used in the design of fire detection and suppression systems in microgravity.",
    ],
    variables: [
      { name: "Flame spread rate", unit: "cm/s" },
      { name: "Ambient flow velocity", unit: "cm/s" },
      { name: "Oxygen concentration", unit: "% vol" },
    ],
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Results from the BASS-II Experiment",
        authors: "P. V. Ferkul et al.",
        year: 2014,
        venue: "Peer-reviewed / NASA Task Book publication",
        kind: "journal",
      },
    ],
  },
  {
    code: "BRE",
    name: "Burning Rate Emulator (ACME)",
    category: "Gaseous Flames",
    objective:
      "Emulate the burning of practical solid fuels using a porous burner burning gaseous fuel, to study materials flammability, extinction behaviour, and the conditions needed for sustained combustion — including low and partial-gravity environments.",
    summary:
      "BRE is one of the ACME studies conducted in the Combustion Integrated Rack. It focuses on spacecraft fire prevention by studying material flammability and extinction behaviour through controlled gaseous-fuel flames that emulate solid-fuel burning, including assessment at low and partial-gravity conditions relevant to future lunar and Mars missions.",
    gravityCondition: "Microgravity (ISS), partial-g assessment",
    facility: "Combustion Integrated Rack (CIR)",
    platform: "International Space Station",
    status: "Completed",
    launchYear: 2017,
    delivery: "SpaceX CRS-11",
    researchAreas: ["Gaseous flames", "Fire prevention", "Extinction behaviour", "Partial gravity"],
    fuelsMaterials: ["Gaseous fuels via porous burner"],
    keyFindings: [
      "Assessed flammability and extinction behaviour under low and partial-gravity environments.",
    ],
    variables: [{ name: "Flame extinction limits", unit: null }],
    sourceUrl: "https://science.nasa.gov/biological-physical/investigations/acme",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Advanced Combustion Microgravity Experiment (ACME) Facility",
        authors: "NASA Science",
        year: 2023,
        venue: "science.nasa.gov",
        kind: "web",
        url: "https://science.nasa.gov/biological-physical/investigations/acme",
      },
    ],
  },
  {
    code: "CFI-G",
    name: "Cool Flames Investigation with Gases (ACME)",
    category: "Gaseous Flames",
    objective:
      "Study cool-flame chemistry in gaseous fuels at conditions where conventional hot flames cannot be sustained, supported by NSF, NASA and CASIS.",
    summary:
      "CFI-G investigates cool flames — low-temperature, faint combustion regimes — using gaseous fuels in the Combustion Integrated Rack. In 2021, NASA reported unusual cool flames discovered aboard the ISS as part of this project. Cool-flame research informs understanding of ignition chemistry relevant to engine efficiency and to low-temperature combustion phenomena that are obscured on Earth.",
    gravityCondition: "Microgravity (ISS)",
    facility: "Combustion Integrated Rack (CIR)",
    platform: "International Space Station",
    status: "Completed",
    launchYear: 2017,
    delivery: "SpaceX CRS-11",
    researchAreas: ["Cool flames", "Gaseous flames", "Low-temperature combustion"],
    fuelsMaterials: ["Gaseous fuels (alkanes)"],
    keyFindings: [
      "Unusual cool flames observed aboard the ISS (reported July 2021); project supported by NSF, NASA and CASIS.",
    ],
    variables: [{ name: "Cool-flame temperature", unit: "K" }],
    sourceUrl: "https://science.nasa.gov/biological-physical/investigations/acme",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Unusual 'cool flames' discovered aboard the International Space Station",
        authors: "NASA / NSF news",
        year: 2021,
        venue: "NASA science news",
        kind: "news",
      },
    ],
  },
  {
    code: "E-FIELD",
    name: "E-FIELD Flames (ACME)",
    category: "Gaseous Flames",
    objective:
      "Measure how electric fields influence diffusion flames aboard the ISS, exploring electric-field control of combustion as a route to improved fuel efficiency and reduced pollutant production.",
    summary:
      "The E-FIELD Flames experiment is one of the ACME inserts; it is equipped with a high-voltage supply and a crew-removable electrode mesh. Initial and preparatory measurements of methane diffusion flames under electric-field influence were reported by Chien and colleagues (2022).",
    gravityCondition: "Microgravity (ISS)",
    facility: "Combustion Integrated Rack (CIR)",
    platform: "International Space Station",
    status: "Completed",
    launchYear: 2017,
    delivery: "SpaceX CRS-11",
    researchAreas: ["Gaseous flames", "Electric-field combustion control", "Ion-driven flows"],
    fuelsMaterials: ["Methane"],
    keyFindings: [
      "Preparatory and initial measurements of methane diffusion flames under electric-field influence reported (Chien et al., 2022).",
    ],
    variables: [
      { name: "Electric field strength", unit: "kV/m" },
      { name: "Flame shape / position response", unit: null },
    ],
    sourceUrl: "https://science.nasa.gov/biological-physical/investigations/acme",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Electric-field effects on methane coflow flames aboard the ISS (ACME E-FIELD)",
        authors: "Y.-C. Chien et al.",
        year: 2022,
        venue: "Peer-reviewed journal article (cited 19)",
        kind: "journal",
      },
    ],
  },
  {
    code: "SoFIE",
    name: "Solid Fuel Ignition and Extinction",
    category: "Solid Fuel",
    objective:
      "Measure ignition and flammability of solid spacecraft materials in practical geometries under controlled external radiant heating and airflow, supporting the selection and screening of materials for space vehicles.",
    summary:
      "SoFIE is a NASA project for solid-fuel combustion in microgravity, consisting of five sub-projects (GEL — Growth and Extinction Limit — is the first). Principal Investigator: Prof. Fletcher Miller, San Diego State University. Experiments run in the Combustion Integrated Rack and measure how solid spacecraft materials ignite, burn and extinguish in realistic geometries.",
    gravityCondition: "Microgravity (ISS)",
    facility: "Combustion Integrated Rack (CIR)",
    platform: "International Space Station",
    status: "Active",
    researchAreas: ["Solid-fuel combustion", "Ignition", "Flammability", "Spacecraft fire safety"],
    fuelsMaterials: ["Polymethyl methacrylate (PMMA) and other solid spacecraft materials"],
    keyFindings: [
      "Five sub-projects including GEL (Growth and Extinction Limit) study ignition and extinction of solid fuels in microgravity.",
    ],
    variables: [
      { name: "Ignition delay time", unit: "s" },
      { name: "Radiant heat flux", unit: "kW/m²" },
      { name: "Flame spread rate", unit: "cm/s" },
    ],
    sourceUrl: "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/solid-fuel-ignition-and-extinction-sofie",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Solid Fuel Ignition and Extinction (SoFIE) — NASA Glenn",
        authors: "NASA Glenn Research Center",
        year: 2025,
        venue: "nasa.gov (PI: Prof. Fletcher Miller, San Diego State University)",
        kind: "web",
        url: "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/solid-fuel-ignition-and-extinction-sofie",
      },
    ],
  },
  {
    code: "SAME",
    name: "Smoke Aerosol Measurement Experiment",
    category: "Soot & Smoke",
    objective:
      "Provide the first real-time aerosol data in a spacecraft microgravity environment by characterizing smoke particle size distributions produced by overheated spacecraft materials, informing smoke detector design.",
    summary:
      "SAME has been conducted twice by NASA and provided the first real-time aerosol measurements in a spacecraft microgravity environment. Smoke from five common spacecraft materials that were overheated was characterized with aerosol instruments measuring moments of the particle size distribution, a thermal precipitator for TEM collection, and a commercial smoke detector. All samples produced significant numbers of sub-micron particles readily detectable by appropriate instruments, and moment-based statistics enabled comparison with ground-based SMPS reference measurements.",
    gravityCondition: "Microgravity (ISS)",
    facility: "Microgravity Science Glovebox (MSG)",
    platform: "International Space Station",
    status: "Completed",
    researchAreas: ["Smoke characterization", "Fire detection", "Aerosol science"],
    fuelsMaterials: ["Five common spacecraft materials (overheated for smoke generation)"],
    keyFindings: [
      "First real-time aerosol data in a spacecraft microgravity environment.",
      "All samples produced significant numbers of sub-micron particles readily detected by suitable instruments.",
      "Moment-method statistics (number, diameter, mass concentration) enable spacecraft smoke detector performance evaluation.",
    ],
    variables: [
      { name: "Particle count mean diameter", unit: "nm" },
      { name: "Number concentration", unit: "1/cm³" },
      { name: "Mass concentration", unit: "mg/m³" },
    ],
    doi: "10.1080/02786826.2015.1025124",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Smoke Characterization and Feasibility of the Moment Method for Spacecraft Fire Detection",
        authors: "J. Yang, T. Cleary, G. Mulholland, M. Meyer, V. Bryg, D. Urban, Z. Yuan, G. Ruff",
        year: 2015,
        venue: "Aerosol Science and Technology, vol. 49",
        kind: "journal",
        doi: "10.1080/02786826.2015.1025124",
        url: "https://www.nist.gov/publications/smoke-characterization-and-feasibility-moment-method-spacecraft-fire-detection",
      },
    ],
  },
  {
    code: "LSP",
    name: "Laminar Soot Processes",
    category: "Soot & Smoke",
    objective:
      "Investigate soot formation and oxidation processes in nonturbulent round gas-jet diffusion flames in still air, providing data for reliable computational combustion calculations of nonpremixed flames.",
    summary:
      "The LSP experiment studied the structure and soot surface reaction properties of laminar nonpremixed (diffusion) jet flames in microgravity, where removal of buoyancy produces long, steady, soot-laden flames that cannot be observed on Earth. Results shed light on soot inception, growth and oxidation processes fundamental to soot emission and smoke formation.",
    gravityCondition: "Microgravity (Space Shuttle)",
    facility: "Shuttle-era combustion module",
    platform: "Space Shuttle",
    status: "Completed",
    researchAreas: ["Soot formation", "Diffusion flames", "Combustion modelling"],
    fuelsMaterials: ["Gaseous hydrocarbon fuels (ethylene, methane)"],
    keyFindings: [
      "Soot processes in round jet diffusion flames in still air characterized without buoyancy distortion.",
    ],
    variables: [
      { name: "Soot volume fraction", unit: "ppm" },
      { name: "Flame height", unit: "mm" },
    ],
    ntrsUrl: "https://ntrs.nasa.gov/api/citations/20050181409/downloads/20050181409.pdf",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Laminar Soot Processes Experiment Shedding Light on Soot Formation",
        authors: "D. L. Urban et al.",
        venue: "NASA Technical Reports Server, citation 20050181409",
        kind: "report",
        url: "https://ntrs.nasa.gov/api/citations/20050181409/downloads/20050181409.pdf",
      },
      {
        title: "Laminar Soot Processes (LSP) Experiment",
        authors: "P. B. Sunderland et al.",
        year: 2003,
        venue: "NASA Technical Reports Server, citation 20040053537",
        kind: "report",
        url: "https://ntrs.nasa.gov/api/citations/20040053537/downloads/20040053537.pdf",
      },
    ],
  },
  {
    code: "CFI",
    name: "Cool Flames Investigation",
    category: "Droplet Combustion",
    objective:
      "Characterize the cool-flame burning regime of isolated liquid-fuel droplets first discovered during FLEX, extending droplet-combustion knowledge to the low-temperature chemistry that controls real-engine ignition and extinction.",
    summary:
      "CFI continues the droplet-combustion series in the Multi-user Droplet Combustion Apparatus within the Combustion Integrated Rack. NASA reported in July 2021 that non-premixed cool flames — low-temperature, faint combustion that survives after the visible hot flame extinguishes — were created during droplet experiments aboard the ISS, a first in the history of microgravity research. Because cool flames are nearly invisible and slow, microgravity is the only environment where their pure behaviour can be isolated from buoyant flows.",
    gravityCondition: "Microgravity (ISS)",
    facility: "Combustion Integrated Rack (CIR)",
    platform: "International Space Station",
    status: "Completed",
    researchAreas: ["Cool flames", "Droplet combustion", "Low-temperature combustion", "Flame extinction"],
    fuelsMaterials: ["n-Heptane droplets", "Large hydrocarbon fuel droplets"],
    keyFindings: [
      "Non-premixed cool flames were created during droplet combustion aboard the ISS — reported by NASA in July 2021 as a first for the space station.",
      "Cool-flame burning confirms a two-stage combustion regime in droplets that terrestrial buoyant flows largely hide.",
    ],
    variables: [
      { name: "Droplet diameter history", unit: "mm" },
      { name: "Cool-flame temperature", unit: "K" },
      { name: "Ambient oxygen concentration", unit: "% vol" },
    ],
    sourceUrl: "https://www.nasa.gov/missions/station/cool-flames-created-during-a-first-for-international-space-station-research",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Cool Flames Created During a First for International Space Station Research",
        authors: "NASA",
        year: 2021,
        venue: "NASA mission news, 14 July 2021",
        kind: "news",
        url: "https://www.nasa.gov/missions/station/cool-flames-created-during-a-first-for-international-space-station-research",
      },
    ],
  },
  {
    code: "SPICE",
    name: "Smoke Point In Co-flow Experiment",
    category: "Soot & Smoke",
    objective:
      "Stabilize enclosed laminar jet flames in co-flowing oxidizer streams, measure flame shape and smoke point behaviour, and validate theoretical and numerical soot-predictions for gaseous fuel flames.",
    summary:
      "SPICE operated in the Microgravity Science Glovebox with a fan-driven co-flow duct. Gaseous-fuel jet flames were burned in controlled co-flowing air so the laminar flame could be held steady and its overall shape measured. The smoke point — the fuel flow at which soot begins to escape the flame tip — is a classical soot metric directly relevant to smoke production and spacecraft smoke-detector design. SLICE later extended this work to flame structure and liftoff.",
    gravityCondition: "Microgravity (ISS)",
    facility: "Microgravity Science Glovebox (MSG)",
    platform: "International Space Station",
    status: "Completed",
    researchAreas: ["Soot formation", "Smoke point", "Co-flow diffusion flames", "Gaseous flames"],
    fuelsMaterials: ["Gaseous hydrocarbon fuels (e.g. ethylene, methane)"],
    keyFindings: [
      "Enclosed laminar co-flow flames stabilized in microgravity and overall flame shapes measured to validate model predictions.",
      "Smoke-point behaviour of gaseous jets characterized without buoyant stretching of the flame.",
    ],
    variables: [
      { name: "Smoke point height", unit: "mm" },
      { name: "Co-flow air velocity", unit: "cm/s" },
      { name: "Flame shape dimensions", unit: "mm" },
    ],
    sourceUrl: "https://www.nasa.gov/wp-content/uploads/2025/07/smoke-point-in-co-flow-experiment-spice.pdf",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Smoke Point in Co-flow Experiment (SPICE) — NASA experiment overview",
        authors: "NASA",
        venue: "NASA experiment factsheet",
        kind: "report",
        url: "https://www.nasa.gov/wp-content/uploads/2025/07/smoke-point-in-co-flow-experiment-spice.pdf",
      },
    ],
  },
  {
    code: "SLICE",
    name: "Structure & Liftoff In Combustion Experiment",
    category: "Gaseous Flames",
    objective:
      "Extend SPICE by studying flame structure, liftoff and attachment of gaseous-fuel jet diffusion flames in co-flow, quantifying how the flame attachment point controls the stability of the entire trailing diffusion flame.",
    summary:
      "SLICE ran in the Microgravity Science Glovebox using the flow duct developed for SPICE. Methane and other gaseous-fuel jet flames were examined under controlled co-flow to measure liftoff, attachment and flame structure in microgravity, where buoyancy no longer distorts the flame base. The investigation significantly extends the SPICE dataset and informs burner-stability design and the airflow limits that determine whether a spacecraft fire sustains, lifts off or extinguishes.",
    gravityCondition: "Microgravity (ISS)",
    facility: "Microgravity Science Glovebox (MSG)",
    platform: "International Space Station",
    status: "Completed",
    researchAreas: ["Flame liftoff", "Flame stability", "Flame structure", "Gaseous flames"],
    fuelsMaterials: ["Methane", "Gaseous hydrocarbon fuels"],
    keyFindings: [
      "Flame attachment point shown to control the stability of the trailing diffusion flame; microgravity testing extended the SPICE co-flow dataset.",
    ],
    variables: [
      { name: "Liftoff height", unit: "mm" },
      { name: "Co-flow air velocity", unit: "cm/s" },
      { name: "Fuel jet velocity", unit: "cm/s" },
    ],
    sourceUrl: "https://www1.grc.nasa.gov/wp-content/uploads/SLICE_Quad.pdf",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Structure and Liftoff In Combustion Experiment (SLICE) — NASA Glenn quad chart",
        authors: "NASA Glenn Research Center",
        venue: "NASA Glenn Research Center",
        kind: "report",
        url: "https://www1.grc.nasa.gov/wp-content/uploads/SLICE_Quad.pdf",
      },
    ],
  },
  {
    code: "SAME-R",
    name: "Smoke Aerosol Measurement Experiment — Reflight",
    category: "Soot & Smoke",
    objective:
      "Quantify the sizes that liquid smoke particulate achieves in low gravity, reflighting the SAME smoke-characterization instruments to confirm and extend the first quantitative determination of smoke particulate size from low-gravity sources.",
    summary:
      "SAME-R was a reflight of the Smoke Aerosol Measurement Experiment instrumentation. The original SAME tests provided the first quantitative determination of the size of smoke particulate produced by low-gravity sources; the reflight extended the particle-size statistics and confirmed instrument behaviour for spacecraft smoke-detector design. The investigation is archived in NASA's Physical Sciences Informatics as PSI-101, with measurement data available.",
    gravityCondition: "Microgravity (ISS)",
    facility: "Microgravity Science Glovebox (MSG)",
    platform: "International Space Station",
    status: "Completed",
    researchAreas: ["Smoke characterization", "Aerosol measurement", "Smoke detection", "Particle size distribution"],
    fuelsMaterials: ["Smoke particulate from overheated materials"],
    keyFindings: [
      "Extended quantitative determination of smoke particulate sizes from low-gravity sources, following the original SAME first measurements.",
      "Results inform selection and sensitivity requirements for spacecraft smoke detectors.",
    ],
    variables: [
      { name: "Particle size distribution", unit: "µm" },
      { name: "Particle concentration", unit: "particles/cm³" },
    ],
    sourceUrl: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-101",
    datasetAvailable: true,
    measurementData: true,
    sources: [
      {
        title: "Smoke Aerosol Measurement Experiment - Reflight (SAME-R) — NASA Glenn quad chart",
        authors: "NASA Glenn Research Center",
        venue: "NASA Glenn Research Center",
        kind: "report",
        url: "https://www1.grc.nasa.gov/wp-content/uploads/SAME-R_Quad.pdf",
      },
      {
        title: "PSI-101 — SAME-R investigation record, NASA Physical Sciences Informatics",
        authors: "NASA",
        venue: "NASA Physical Sciences Informatics",
        kind: "web",
        url: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-101",
      },
    ],
  },
  {
    code: "DAFT",
    name: "Dust and Aerosol Measurement Feasibility Test",
    category: "Soot & Smoke",
    objective:
      "Determine whether a modified P-Trak condensation particle counter — a key candidate component for future spacecraft smoke and dust monitors — operates correctly in microgravity, as a NASA Glenn risk-mitigation test.",
    summary:
      "DAFT was a risk-mitigation experiment developed at NASA Glenn Research Center and flown on the Space Shuttle during the Expedition 13 era (2006). It tested a modified P-Trak condensation particle counter in microgravity to ensure the instrument would function as a component of future spacecraft smoke detectors and environmental monitors. Feasibility of reliable particle counting in weightlessness directly supports fire detection and, later, lunar-dust monitoring for exploration vehicles.",
    gravityCondition: "Microgravity (Space Shuttle)",
    facility: "Shuttle middeck",
    platform: "Space Shuttle",
    status: "Completed",
    launchYear: 2006,
    researchAreas: ["Dust detection", "Aerosol measurement", "Environmental monitoring", "Smoke detection"],
    fuelsMaterials: ["Test aerosols and ambient particulate (no combustion fuel)"],
    keyFindings: [
      "Modified P-Trak condensation particle counter validated for microgravity operation as a risk-mitigation step toward spacecraft smoke/dust monitors.",
    ],
    variables: [
      { name: "Particle count concentration", unit: "particles/cm³" },
      { name: "Microgravity operation duration", unit: "min" },
    ],
    sourceUrl: "https://www.spacefacts.de/iss/english/exp_13.htm",
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "Dust and Aerosol measurement Feasibility Test (DAFT) — Expedition 13 press kit",
        authors: "NASA",
        year: 2006,
        venue: "NASA Expedition 13 press kit",
        kind: "report",
        url: "https://www.nasa.gov/wp-content/uploads/2023/06/expedition13-presskit.pdf",
      },
      {
        title: "ISS Expedition 13 — DAFT experiment summary",
        authors: "spacefacts.de",
        year: 2020,
        venue: "spacefacts.de ISS experiment catalogue",
        kind: "web",
        url: "https://www.spacefacts.de/iss/english/exp_13.htm",
      },
    ],
  },
  {
    code: "DAFT-2",
    name: "Dust and Aerosol Measurement Feasibility Test-2",
    category: "Soot & Smoke",
    objective:
      "Continue the DAFT risk-mitigation series, further qualifying aerosol particle-counter instruments for spacecraft smoke detection and future lunar-dust environmental monitoring aboard exploration vehicles.",
    summary:
      "DAFT-2 is the follow-on feasibility test to DAFT in NASA Glenn's combustion and environmental-monitoring research line. It extended the microgravity qualification of particle-counter instrumentation toward operational smoke detectors and dust monitors for new exploration vehicles. No numerical results are curated in this record; the investigation is documented in NASA physical sciences research presentations.",
    gravityCondition: "Microgravity (Space Shuttle)",
    facility: "Shuttle middeck",
    platform: "Space Shuttle",
    status: "Completed",
    researchAreas: ["Dust detection", "Aerosol measurement", "Environmental monitoring"],
    fuelsMaterials: ["Test aerosols and ambient particulate (no combustion fuel)"],
    keyFindings: [
      "Continued microgravity qualification of particle-counter instruments documented in NASA physical sciences research presentations (2016).",
    ],
    variables: [{ name: "Particle count concentration", unit: "particles/cm³" }],
    datasetAvailable: false,
    measurementData: false,
    sources: [
      {
        title: "NASA Physical Sciences Research Presentation — DAFT and DAFT-2 combustion science",
        authors: "NASA Glenn Research Center",
        year: 2016,
        venue: "NASA physical sciences research presentation",
        kind: "report",
      },
    ],
  },
];

async function main() {
  await db.source.deleteMany();
  await db.investigation.deleteMany();

  for (const r of CORPUS) {
    const rec = await db.investigation.create({
      data: {
        code: r.code,
        name: r.name,
        category: r.category,
        objective: r.objective,
        summary: r.summary,
        gravityCondition: r.gravityCondition,
        facility: r.facility,
        platform: r.platform,
        status: r.status,
        launchYear: r.launchYear ?? null,
        delivery: r.delivery ?? null,
        researchAreas: JSON.stringify(r.researchAreas),
        fuelsMaterials: JSON.stringify(r.fuelsMaterials),
        keyFindings: JSON.stringify(r.keyFindings),
        variables: JSON.stringify(r.variables),
        doi: r.doi ?? null,
        sourceUrl: r.sourceUrl ?? null,
        ntrsUrl: r.ntrsUrl ?? null,
        datasetAvailable: r.datasetAvailable,
        measurementData: r.measurementData,
      },
    });
    for (const s of r.sources) {
      await db.source.create({
        data: {
          investigationId: rec.id,
          title: s.title,
          authors: s.authors,
          year: s.year ?? null,
          venue: s.venue,
          kind: s.kind,
          doi: s.doi ?? null,
          url: s.url ?? null,
        },
      });
    }
  }
  console.log(`Seeded ${CORPUS.length} investigations.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
