# Group6_COS30045-GitHub-Classroom-Team

Group project for COS30045 (Data Visualisation) — **Road Safety Enforcement in Australia**.

## Website Objective

This website investigates road safety enforcement data across Australia for the period 2023–2024, focusing on two key enforcement areas: **drug driving** and **speeding**. The aim is to move beyond raw enforcement statistics and present them as an accessible, interactive visual narrative that supports data-driven discussion around road safety policy and public awareness.

Specifically, the website helps the audience answer questions such as:

- How do drug testing volumes and positive test rates change over time?
- What trends exist in drug-driving charges and arrests, and which age groups are most affected?
- Which jurisdictions issue the most fines, for both drug driving and speeding?
- Which drug types are most frequently detected, and where?
- How do speeding fines break down by detection method (camera vs. police) and by jurisdiction?

## Dataset Used

The analysis draws on publicly available Australian road safety enforcement data:

- **[Road Safety Enforcement Data](https://catalogue.data.infrastructure.gov.au/dataset/road-safety-enforcement-data)** — Australian Government, Department of Infrastructure, Transport, Regional Development, Communications and the Arts.
- **[Police Enforcement & Road Safety Data](https://datahub.roadsafety.gov.au/safe-systems/safe-road-use/police-enforcement#anchor-driving-under-the-influence-of-drugs)** — National Road Safety Data Hub.

These datasets cover drug tests conducted, positive test results, charges, arrests, and fines issued across Australian states and territories, broken down by year, age group, jurisdiction, and (for drug offences) substance type.

**Known data limitations:**

- Northern Territory data is missing for several years (pre-2021, and again in 2023–2024) for drug tests conducted.
- From 2023 onward, positive test results were requested across three testing stages, but not all states/territories supplied data for every stage.
- Victoria only reports detection data — fines, arrests, and charges are not included. Its roadside testing also only covers MDMA, methamphetamine, and THC; other drugs are detected only via post-collision blood analysis, which is excluded from this dataset.

## Insights Provided to the Audience

The website is structured around interactive charts, each answering a specific guiding question:

| Section | Insight |
|---|---|
| **Drug Tests Over Time** | Tracks drug tests conducted vs. positive results by quarter, revealing fluctuations rather than a steady trend, with peak testing in Q1 2024 and peak positive results in Q4 2023. |
| **Charges & Arrests** | Shows a steady increase in enforcement actions from 2023–2024, with the 26–39 age group most affected, and the youngest (0–16) and oldest (65+) groups least affected. |
| **Fines by Jurisdiction** | Highlights stark regional disparities in drug-driving fines, led by NSW, followed by SA and NT, with several jurisdictions recording zero fines. |
| **Drug Types by Jurisdiction** | A heatmap comparing detected substances across jurisdictions, showing NSW with the highest detections (especially cannabis and amphetamine), while QLD, TAS, and WA recorded none. |
| **Speeding Overview** | Summarises total fines, camera vs. police-issued fines, arrests, and charges, with camera enforcement dominating overall speeding penalties. |
| **Speeding Breakdown** | Visualises fines per 10,000 licences, fines by jurisdiction, and the detection method split (camera vs. police), giving a comparative view of enforcement intensity across regions. |

Together, these visualisations aim to give policymakers, researchers, and the general public a clearer, evidence-based understanding of where and how road safety enforcement is concentrated across Australia, and where data gaps still exist.
