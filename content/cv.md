---
pageTitle: Nikita Vostrosablin | CV
description: Nikita Vostrosablin, PhD - Engineering Manager focused on AI and distributed systems.
promptPrefix: nikita@cv:~$
promptCommand: cat nikita_vostrosablin_cv.txt
name: Nikita Vostrosablin, PhD
subtitle: Engineering Manager | AI & Distributed Systems | Python, Kubernetes, AWS
location: Prague, Czech Republic
---

<!--
Edit this file, then run `npm run build`.

Syntax:
- Use `##` for a normal section.
- Wrap two `##` sections in `::: columns` ... `:::` for a two-column row.
- In `## Experience`, use `### Company` and `#### Role | Dates | Location`.
- Use normal paragraphs and `-` lists for section content.
-->

## Contact
- [nikita.vostrosablin@gmail.com](mailto:nikita.vostrosablin@gmail.com)
- [linkedin.com/in/nikita-vostrosablin-phd-98461594](https://www.linkedin.com/in/nikita-vostrosablin-phd-98461594)

## Experience
### Stats Perform
#### Engineering Manager | Jul 2025 - Present | Prague, Czechia
Lead a team of 9–12 engineers (predominantly mid-level, ~20% senior) owning a portfolio of ~30 production data pipelines and ~150 services powering real-time and batch sports analytics systems.

##### Scope & Systems
- Own architecture, reliability, and delivery of distributed Python systems running on AWS (SQS/SNS, Lambda) and Kubernetes, with Kafka/Flink-based streaming pipelines
- Responsible for end-to-end production health and on-call operations across all owned services
- Process data for ~15K matches/year, including real-time ingestion and post-game reprocessing workflows

##### Scale & Performance
- Systems process ~10⁵–10⁶ events/day across pipelines (depending on competition load), with peak per-service throughput of ~10–50 events/sec and streaming workloads at 25 Hz (video frame rate)
- Maintain real-time processing latency of ≤5 minutes behind game clock for live pipelines
- Reduced processing time in key pipelines by up to ~80% via architectural redesign and algorithmic optimization (e.g., eliminated Kafka single-topic bottlenecks by introducing fan-out architectures across services)

##### Reliability & Operability
- Defined and enforced pipeline-level SLOs (latency and data completeness), e.g.:
  - metric generation every minute with ≤5 min latency
  - ≥95% successful batch completion rate
- Introduced structured observability (metrics, alerting, on-call processes), reducing:
  - incident resolution time from multiple days → ~1 day
  - support allocation from ~25% → ~2% of team capacity
- Led cross-team incident resolution for systemic failures, identifying upstream bottlenecks and driving organization-level support process changes

##### Architecture & Design
- Designed hybrid event-driven architecture:
  - Kafka for streaming and inter-team integration
  - SQS/SNS for internal service fan-out and decoupling
  - Built primarily stateless microservices with externalized state (e.g., DynamoDB)
  - Example of a challenge: Solved ordering constraints in distributed pipelines via resequencing mechanisms to handle upstream parallelization inconsistencies

##### AI/ML Platform Integration
- Productionized ML pipelines supporting:
  - computer vision models (video-based inference)
  - transformer-based imputation models
  - many other model architectures (e.g. gradient boosting models etc)
- Supported both online and offline inference workflows, ensuring pipeline integration and latency constraints (~minutes-scale SLA per game segment)
- Partnered with AI teams owning model evaluation; responsible for reliability and scalability of inference pipelines

##### Execution & Delivery
- Established CI/CD and service standardization enabling multiple deployments per day
- Reduced idea-to-production lead time to ~1 week on average
- Improved delivery velocity through platform standardization, documentation, and automation initiatives

##### Leadership & Org Impact
- Hired 3 engineers directly; contributed to dozens of hiring processes
- Led 2 promotions and managed underperformance through structured feedback and coaching
- Reorganized team into squad-based ownership model, improving focus and accountability
- Initiated and led RQDX program (Reliability, Quality, Developer Experience):
  - reduced technical debt
  - standardized services
  - improved developer productivity and system reliability

##### Cross-Team Impact
- Systems serve as critical dependencies for multiple downstream teams and products
- Core contributor to multi-team architecture design for a large-scale streaming platform

#### Senior Software Engineer, Team Lead | Dec 2023 - Jul 2025
Led a sub-team delivering machine-learning products for Opta Vision. Built event-driven AWS architecture, microservices on Kubernetes, and a CI/CD-focused delivery model for stable and fast production deployments.

- Kubernetes (K8s), Apache Kafka, AWS event-driven workloads
- Microservices and event-driven architecture design
- Planning, stakeholder communication, and architecture reviews

### MSD Czech Republic
#### Scientific Software Engineer, Team Lead | Jul 2021 - Nov 2023 | Prague, Czechia
- Developed advanced algorithms for scientific and bioinformatics applications
- Contributed to a patented reaction-pathfinder system (US Patent: 20240105285)
- Built AWS-based, event-driven genomics platforms with Batch, Lambda, Step Functions, SQS, DynamoDB, and Redshift
- Implemented Terraform-based infrastructure, CI/CD, and production observability practices
- Led cross-functional delivery of a production mRNA optimization platform

#### Python Developer / Machine Learning Engineer | May 2019 - Jul 2021
Worked in the AI group across business domains and collaborated with bioinformatics teams on molecular computation and optimization challenges for drug discovery.

### Dimension Data
#### Data ETL Engineer | Dec 2017 - Apr 2019 | Czech Republic
- Built BI infrastructure from scratch for a major European client
- Designed automated dataflows and operational reporting workflows
- Maintained data quality and stakeholder-facing delivery

### ORIFLAME SOFTWARE
#### Intern - Data Scientist, BI/DWH Developer | Jun 2017 - Aug 2017 | Olomouc
- Applied ML and NLP for sales forecasting and customer-review sentiment analysis
- Built ETL connector pipelines with Pentaho ETL and Python automation

### Freelance
#### Freelance Web Developer | Sep 2016 - Dec 2016
Built web tooling and automated mail reporting for a renovation-oriented web service using Node.js, HTML, CSS preprocessors, and template engines.

### DTU - Technical University of Denmark
#### Researcher | Sep 2016 - Nov 2016 | Kongens Lyngby, Denmark
Worked on quantum optomechanics research with focus on theoretical foundations of a stroboscopic optomechanical transducer in collaboration with an experimental research team.

::: columns
## Education
- **Univerzita Palackeho v Olomouci**<br />PhD, Quantum Physics (Sep 2014 - Mar 2021)
- **Lomonosov Moscow State University (MSU)**<br />Master of Science, Physics (2008 - 2014)

## Languages
- Russian (Native or Bilingual)
- English (Professional Working)
- French (Limited Working)
- Czech (Elementary)
:::

::: columns
## Certifications
- Spark and Python for Big Data with PySpark
- Apache Spark 2 with Python - Big Data with PySpark and Spark

## Selected Publications
- Statistical spring in the Advanced LIGO detector with unbalanced arms and in the Michelson-Sagnac interferometer
- mRNAid, an open-source platform for therapeutic mRNA design and optimization strategies
- Pulsed quantum interaction between two distant mechanical oscillators
- Squeezer-based pulsed optomechanical interface
- Pulsed quantum continuous-variable optoelectromechanical transducer
:::
