---
pageTitle: Nikita Vostrosablin | CV
description: Nikita Vostrosablin, PhD - Engineering Manager focused on AI and distributed systems.
promptPrefix: nikita@cv:~$
promptCommand: cat nikita_vostrosablin_cv.txt
name: Nikita Vostrosablin, PhD
subtitle: Engineering Leader focused on production ML and backend systems. I bring experience from both research-heavy and product-focused environments and remain deeply technical while driving operational improvements.
location: Prague, Czechia
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
Lead a team of 9–12 engineers (predominantly mid-level, ~20% senior) owning production ML and data pipelines that support sports analytics products used by some of the world’s biggest broadcasters and professional clubs.

##### Scope & Systems
- Own architecture, reliability, and stability of ~30 production ML and data pipelines and ~150 distributed Python services running on AWS and on-prem Kubernetes clusters.
- Drive architectural decisions for new systems and product launches, while improving the reliability and operability of existing production systems.
- Own end-to-end production health, incident response, and on-call operations across all owned services.

##### Scale & Performance
- Systems operate across both high-throughput pipelines processing thousands of events/sec and streaming workloads running at 25 Hz (video broadcast frame rate).
- *Example of a key achievement*: Reduced processing time in key pipelines by up to ~80% via architectural redesign and algorithmic optimization (e.g., eliminated Kafka single-topic bottlenecks by introducing fan-out architectures across services)

##### Reliability & Operability (Contribution Examples)
- Defined and enforced pipeline-level SLOs (latency and data completeness), e.g.:
  - metric generation every minute with ≤5 min latency
  - ≥95% successful batch completion rate
- Introduced structured observability (metrics, alerting, on-call processes), reducing:
  - incident resolution time from multiple days → ~1 day
  - support allocation from ~25% → ~2% of team capacity
- Led cross-team incident resolution for systemic failures, identifying upstream bottlenecks and driving organization-level support process changes

##### Architecture & Design
- Continuously contributed to the architectural design of multiple systems, both within the team and across team boundaries, shaping pipelines, and services designs across AWS/cloud and on-prem data center environments.
- *Example of contribution:* Influenced cross-team technology choices during the design of a shared streaming system by identifying Apache Flink as a better fit than the sub-optimal technologies used in the initial PoC, educating 3 collaborating teams on the trade-offs, and helping drive adoption; the pipeline was later rebuilt with Flink and confirmed by engineers as the stronger solution.

##### AI/ML Platform Integration
- Supported both online and offline inference workflows, ensuring pipeline integration and latency constraints (~minutes-scale SLA per game segment)
- Partnered with AI teams owning model evaluation; responsible for reliability and scalability of inference pipelines

##### Execution & Delivery
- Established CI/CD and service standardization enabling multiple deployments per day
- Reduced idea-to-production lead time to ~1 week on average
- Improved delivery velocity through platform standardization, documentation, and automation initiatives

##### Leadership & Org Impact
- Hired 3 engineers directly; contributed to dozens of hiring processes across multiple teams
- Led 3 promotions and managed underperformance through structured feedback and coaching
- Reorganized team into squad-based ownership model, improving focus and accountability, and introduced the DX4 framework to track team performance through a combination of automated metrics collection and team surveys.
- Initiated and led RQDX program (Reliability, Quality, Developer Experience):
  - reduced technical debt
  - standardized services
  - improved developer productivity and system reliability

##### Cross-Team Impact
- Systems serve as critical dependencies for multiple downstream teams and products
- Core contributor to multi-team architecture design for a large-scale streaming platform

##### AI Adoption
- Led AI adoption in the team by treating AI as a tool rather than a shortcut: focused first on preparing the engineering environment, workflows, and guardrails needed to avoid "garbage in, garbage out," while keeping human review and control over generated outputs.
- Drove adoption through education, practical enablement, and result-based work with skeptics, moving the team from near-zero usage to a state where ~75–80% of code is generated by agents under controlled workflows.

#### Senior Software Engineer, Team Lead | Dec 2023 - Jul 2025 | Prague, Czechia
Acted as technical lead for a 4-engineer sub-team responsible for productionizing ML pipelines and distributed systems for the Opta Vision platform, delivering AI-driven metrics across multiple competitions.

##### Key Contributions

- Designed and implemented multiple event-driven pipelines and services generating real-time and post-game metrics
  - (Scale of the systems is described in the EM section above) 
- Rebuilt underperforming pipelines, removing architectural bottlenecks and improving throughput
- Identified and fixed critical inefficiencies in DynamoDB usage:
  - redesigned schema to eliminate expensive scan operations
  - achieved significant cost reduction and performance improvement
- Led migration of compute workloads from AWS-managed services to Kubernetes as part of a cost optimization initiative

##### Technical Leadership

- Drove architecture decisions
- Mentored engineers
- Introduced design-first development (design docs), improving alignment and reducing rework
- Participated in hiring processes


### Merck (MSD Czech Republic)
#### Scientific Software Engineer, Team Lead | Jul 2021 - Nov 2023 | Prague, Czechia
- Developed advanced algorithms for scientific and bioinformatics applications
- Contributed to a patented reaction-pathfinder system (US Patent: 20240105285)
- Built AWS-based, event-driven genomics platforms with Batch, Lambda, Step Functions, SQS, DynamoDB, and Redshift
- Implemented Terraform-based infrastructure, CI/CD, and production observability practices
- Led cross-functional delivery of a production mRNA optimization platform

#### Python Developer / Machine Learning Engineer | May 2019 - Jul 2021 | Prague, Czechia
Worked in the AI group across business domains and collaborated with bioinformatics teams on molecular computation and optimization challenges for drug discovery.

### Dimension Data
#### Data ETL Engineer | Dec 2017 - Apr 2019 | Prague, Czechia
- Built BI infrastructure from scratch for a major European client
- Designed automated dataflows and operational reporting workflows
- Maintained data quality and stakeholder-facing delivery

### ORIFLAME SOFTWARE
#### Intern - Data Scientist, BI/DWH Developer | Jun 2017 - Aug 2017 | Olomouc, Czechia
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
- Russian (Native)
- English (Fluent, Professional Working)
- French (Limited Working)
- Czech (Intermediate)
:::

::: columns
## Technologies
- **Languages & Core:** Python, Go, SQL, Bash, C++, JavaScript
- **Cloud & Infrastructure:** AWS, Kubernetes, IaaC (Terraform), CI/CD (Jenkins, ArgoCD)
- **Streaming & Messaging:** Kafka, Apache Flink, SQS, SNS
- **Databases:** Relational (Redshift, PostgreSQL, MySQL), NoSQL (DynamoDB), Graph (Neo4j)
- **ML / Data Science:** pandas, Polars, scikit-learn, PyTorch
- **Orchestration:** Airflow, Temporal
- **Observability:** ELK, Grafana, OpenTelemetry

## Selected Publications
- Statistical spring in the Advanced LIGO detector with unbalanced arms and in the Michelson-Sagnac interferometer
- mRNAid, an open-source platform for therapeutic mRNA design and optimization strategies
- Pulsed quantum interaction between two distant mechanical oscillators
- Squeezer-based pulsed optomechanical interface
- Pulsed quantum continuous-variable optoelectromechanical transducer
:::
